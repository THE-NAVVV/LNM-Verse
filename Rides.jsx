import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion, increment, serverTimestamp, getDoc, where } from 'firebase/firestore';
import { FaCar, FaTaxi, FaPlus, FaWhatsapp, FaUser, FaMapMarkerAlt, FaUsers, FaArrowRight, FaPhoneAlt, FaIdCard, FaHistory, FaCalendarAlt, FaTrash, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';


const Rides = () => {
  const [activeTab, setActiveTab] = useState('share'); 
  const [rides, setRides] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  // --- STATE FOR BOOKING CAB/AUTO ---
  const [cabRoute, setCabRoute] = useState("raja_park");
  const [customDestination, setCustomDestination] = useState(""); 
  const [cabPax, setCabPax] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [myCabBookings, setMyCabBookings] = useState([]);
  const [cabPhone, setCabPhone] = useState(""); // 👈 NEW: Phone Number
  
  // --- STATE FOR CANCELLATION ---
  const [cancelModal, setCancelModal] = useState(null); // Stores { id: '...', status: '...' }
  const [cancelReason, setCancelReason] = useState("");
  const [agreePenalty, setAgreePenalty] = useState(false);

  // --- STATE FOR CHAT ---
  const [chatModal, setChatModal] = useState(null); // Stores { rideId, creatorName, creatorPhone }

  // --- STATE FOR CREATING RIDE ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRide, setNewRide] = useState({ from: 'LNMIIT', to: '', date: '', time: '', seats: 3, mode: 'Cab', creatorRoll: '' });


  // --- STATE FOR JOINING RIDE ---
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [joinPaxCount, setJoinPaxCount] = useState(1);
  const [joinDetails, setJoinDetails] = useState([{ name: '', roll: '', phone: '' }]);


  // Constants
  const CANCELLATION_REASONS = [
      "Change of plans (Date/Time)",
      "Booked by mistake",
      "Found another option",
      "Train/Bus cancelled",
      "Other reason"
  ];


  // --- 1. FETCH CURRENT USER DATA ---
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
        if(user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if(userDoc.exists()) {
                setCurrentUserData(userDoc.data());
                setNewRide(prev => ({...prev, creatorRoll: userDoc.data().rollNo || ''}));
            }
        }
    });
    return () => unsubscribeAuth();
  }, []);


  // --- 2. FETCH SHARED RIDES ---
  useEffect(() => {
    const q = query(collection(db, "rides"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);


  // --- 3. FETCH MY CAB BOOKINGS ---
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        if (user) {
            const q = query(
                collection(db, "cab_bookings"), 
                where("userId", "==", user.uid)
            );


            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Client-side sorting
                bookings.sort((a, b) => {
                    const timeA = a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                setMyCabBookings(bookings);
            });
            return () => unsubscribeSnapshot();
        } else {
            setMyCabBookings([]);
        }
    });
    return () => unsubscribeAuth();
  }, []);


  // --- 4. PRICING LOGIC ---
  useEffect(() => {
    let pricePerHead = 0;
    const p = parseInt(cabPax);


    if (cabRoute === 'other') {
        setCalculatedPrice(0); 
        return;
    }
    // Pricing logic 
    switch(cabRoute) {
        case "raja_park": p === 1 ? pricePerHead=300 : p > 3 ? pricePerHead=100 : pricePerHead=150; break;
        case "ajmeri_gate": p === 1 ? pricePerHead=400 : p === 2 ? pricePerHead=200 : p === 3 ? pricePerHead=150 : pricePerHead=100; break;
        case "airport": 
        case "sanganer":
        case "durgapura": p === 1 ? pricePerHead=600 : p === 2 ? pricePerHead=250 : p === 3 ? pricePerHead=225 : pricePerHead=200; break;
        case "junction": p === 1 ? pricePerHead=500 : p === 2 ? pricePerHead=250 : p === 3 ? pricePerHead=150 : pricePerHead=130; break;
        default: pricePerHead = 0;
    }
    setCalculatedPrice(pricePerHead * p);
  }, [cabRoute, cabPax]);


  const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };


  // --- HANDLERS ---
  
  const handleCreateRide = async () => {
    if (!auth.currentUser) return alert("Login First!");
    if (!newRide.from || !newRide.to || !newRide.date || !newRide.time) return alert("Please fill all fields");
    if (!newRide.creatorRoll) return alert("Please enter your Roll No.");
    if (!shareRidePhone || shareRidePhone.length < 10) return alert("Please enter valid mobile number.");


    try {
        await addDoc(collection(db, "rides"), {
            creatorName: auth.currentUser.displayName || "Student",
            creatorId: auth.currentUser.uid,
            creatorPhone: shareRidePhone, 
            creatorRoll: newRide.creatorRoll.toUpperCase(),
            from: newRide.from,
            to: newRide.to,
            time: `${formatDate(newRide.date)} at ${newRide.time}`,
            rawDate: newRide.date,
            totalSeats: parseInt(newRide.seats),
            availableSeats: parseInt(newRide.seats),
            mode: newRide.mode,
            passengers: [], 
            timestamp: serverTimestamp()
        });
        setShowCreateModal(false);
        setNewRide({ from: 'LNMIIT', to: '', date: '', time: '', seats: 3, mode: 'Cab', creatorRoll: '' });
        setShareRidePhone("");
    } catch (e) { alert("Error creating ride: " + e.message); }
  };


  const handleDeleteRide = async (rideId) => {
    if (window.confirm("Are you sure you want to delete this ride?")) {
        try {
            await deleteDoc(doc(db, "rides", rideId));
            alert("Ride deleted successfully.");
        } catch (e) {
            alert("Error deleting ride: " + e.message);
        }
    }
  };


  const openJoinModal = (ride) => {
    setSelectedRide(ride);
    setJoinPaxCount(1);
    setJoinDetails([{ 
        name: currentUserData?.name || auth.currentUser?.displayName || '', 
        roll: currentUserData?.rollNo || '', 
        phone: currentUserData?.phone || auth.currentUser?.phoneNumber || '' 
    }]); 
    setShowJoinModal(true);
  };

  // --- SHARE RIDE PHONE STATE ---
  const [shareRidePhone, setShareRidePhone] = useState("");


  const handlePaxChange = (num) => {
    setJoinPaxCount(num);
    const newDetails = [];
    for(let i=0; i<num; i++) {
        if (i < joinDetails.length) newDetails.push(joinDetails[i]);
        else newDetails.push({ name: '', roll: '', phone: '' });
    }
    setJoinDetails(newDetails);
  };


  const handleJoinInput = (index, field, value) => {
    const updated = [...joinDetails];
    updated[index][field] = value;
    setJoinDetails(updated);
  };


  const handleJoinSubmit = async () => {
    if (!auth.currentUser) return alert("Login First!");
    if (selectedRide.availableSeats < joinPaxCount) return alert("Seats filled up just now!");


    try {
        const rideRef = doc(db, "rides", selectedRide.id);
        await updateDoc(rideRef, {
            availableSeats: increment(-joinPaxCount),
            passengers: arrayUnion(...joinDetails) 
        });
        alert("Ride Joined Successfully!");
        setShowJoinModal(false);
    } catch (e) { alert("Join failed."); }
  };


  // 🔴 UPDATED: BOOKING LOGIC WITH PHONE & ADVANCE
  const handleBookCab = async () => {
    if (!auth.currentUser) return alert("Login First!");
    // Validate Phone
    if (!cabPhone || cabPhone.length < 10) return alert("Please enter valid mobile number.");


    setIsBooking(true);
    
    const finalRoute = cabRoute === 'other' ? `Other: ${customDestination}` : cabRoute;
    const finalPrice = cabRoute === 'other' ? 0 : calculatedPrice;
    
    // Logic: 100 Advance, Balance Due
    const advance = 100;
    const balance = finalPrice > 0 ? finalPrice - 100 : 0;


    try {
        await addDoc(collection(db, "cab_bookings"), {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "User",
            userPhone: auth.currentUser.phoneNumber || "N/A",
            contactNumber: cabPhone, // 👈 Saving Manual Phone
            route: finalRoute,
            passengers: cabPax,
            totalPrice: finalPrice,
            advancePaid: advance, // 👈 Advance Field
            balanceDue: balance,  // 👈 Balance Field
            status: "pending", 
            timestamp: serverTimestamp()
        });
        setIsBooking(false);
        setCabPhone(""); // Reset Phone
        setShowMyBookings(true); 
    } catch (e) { alert("Booking failed"); setIsBooking(false); }
  };


  // --- CANCEL LOGIC ---
  const initiateCancel = (booking) => {
      setCancelModal({ id: booking.id, status: booking.status });
      setCancelReason(CANCELLATION_REASONS[0]);
      setAgreePenalty(false);
  };


  const submitCancellation = async () => {
      if (!cancelModal) return;


      try {
        await updateDoc(doc(db, "cab_bookings", cancelModal.id), {
            status: "cancelled",
            cancelReason: cancelReason,
            penaltyApplied: cancelModal.status === 'confirmed' // Mark if penalty was applied
        });
        setCancelModal(null);
        alert("Ride cancelled successfully.");
      } catch (e) {
          alert("Error cancelling: " + e.message);
      }
  };


  // --- CHAT HANDLER (NEW) ---
  const openChat = (ride) => {
    setChatModal({
      rideId: ride.id,
      creatorName: ride.creatorName,
      creatorPhone: ride.creatorPhone,
      to: ride.to
    });
  };

  const closeChat = () => {
    setChatModal(null);
  };


  const getStatusColor = (status) => {
      const s = status ? status.toLowerCase() : 'pending';
      switch(s) {
          case 'pending': return 'bg-yellow-100 text-yellow-700';
          case 'confirmed': return 'bg-green-100 text-green-700';
          case 'cancelled': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  }


  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <div className="bg-teal-700 p-6 rounded-none shadow-lg sticky top-0 z-10 text-white">
        <h1 className="text-2xl font-black italic tracking-tight">Zoom & Vroom</h1>
        <p className="text-teal-200 text-xs font-bold uppercase tracking-widest">Share or Book Instantly</p>
      </div>


      {/* TABS */}
      <div className="flex p-4 gap-4">
        <button onClick={() => setActiveTab('share')} className={`flex-1 py-3 rounded-none font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'share' ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>
            <FaCar /> Share Ride
        </button>
        <button onClick={() => setActiveTab('book')} className={`flex-1 py-3 rounded-none font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'book' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400'}`}>
            <FaTaxi /> Book Cab/Auto
        </button>
      </div>


      {/* --- CONTENT: SHARE RIDE --- */}
      {activeTab === 'share' && (
        <div className="px-4 space-y-4">
            <button onClick={() => setShowCreateModal(true)} className="w-full bg-teal-50 border border-teal-200 p-4 rounded-none flex items-center justify-center gap-2 text-teal-700 font-bold mb-2 hover:bg-teal-100 transition-colors">
                <FaPlus /> Post a New Ride
            </button>


            {rides.length === 0 ? (
                <div className="text-center py-10 opacity-40 font-bold">No active rides found.</div>
            ) : (
                rides.map(ride => {
    // ✅ FIXED LOGIC: Strict check
    const currentUid = auth.currentUser?.uid;
    const rideOwnerId = ride.creatorId || ride.userId; // Dono check karega (Safety ke liye)
    
    // Sirf tab true hoga jab User Logged in ho AUR ID match kare
    const isCreator = currentUid && rideOwnerId && currentUid === rideOwnerId;
    
    const isFull = ride.availableSeats <= 0;
    
    return (
                    <div key={ride.id} className={`p-5 rounded-none shadow-sm border relative overflow-hidden ${isCreator ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <div className="bg-gray-100 p-2 rounded-full"><FaUser className="text-gray-500"/></div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">{ride.creatorName} {isCreator && <span className="text-[10px] text-blue-500 font-black">(You)</span>}</h3>
                                    <p className="text-[10px] text-teal-600 font-bold uppercase bg-teal-50 px-1 rounded inline-block">
                                        {ride.creatorRoll ? `${ride.creatorRoll}` : "External"}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-none text-[10px] font-black uppercase">{ride.mode}</span>
                        </div>

                        {/* 🟢 NEW: PHONE NUMBER DISPLAY */}
                        {!isCreator && ride.creatorPhone && ride.creatorPhone !== "N/A" && (
                            <div className="bg-green-50 border border-green-200 p-2 rounded-none mb-3 flex items-center gap-2">
                                <FaPhoneAlt className="text-green-600 text-sm" />
                                <span className="text-sm font-bold text-green-700">{ride.creatorPhone}</span>
                            </div>
                        )}

                        {/* Route */}
                        <div className="flex items-center gap-3 mb-3 font-black text-gray-700 text-lg">
                            <span>{ride.from}</span>
                            <FaArrowRight className="text-gray-300 text-sm"/>
                            <span>{ride.to}</span>
                        </div>


                        {/* Details */}
                        <div className="flex justify-between items-center text-xs text-gray-500 font-bold mb-4">
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-none">
                                <FaCalendarAlt className="text-gray-400"/> {ride.time}
                            </span>
                            <span className={`flex items-center gap-1 ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                                <FaUsers /> {isFull ? "FULL" : `${ride.availableSeats} Left`}
                            </span>
                        </div>
                        
                        {/* --- CREATOR ONLY: PASSENGER LIST --- */}
                        {isCreator && ride.passengers && ride.passengers.length > 0 && (
                            <div className="mb-4 bg-white p-3 rounded-none border border-blue-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><FaInfoCircle/> Joined Passengers</p>
                                <div className="space-y-2">
                                    {ride.passengers.map((p, i) => (
                                        <div key={i} className="text-xs flex flex-col border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                            <span className="font-bold text-gray-700">{p.name}</span>
                                            <span className="text-[10px] text-gray-400">{p.roll} • {p.phone}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Actions */}
                        <div className="flex gap-2">
                            {!isCreator && (
                                <button onClick={() => openChat(ride)} className="bg-green-100 text-green-600 p-3 rounded-none flex-1 flex items-center justify-center gap-1 font-bold text-xs hover:bg-green-200 transition-colors">
                                    <FaWhatsapp size={16} /> Chat
                                </button>
                            )}
                            {isCreator ? (
                                <div className="flex gap-2 w-full">
                                    <div className="bg-blue-100 text-blue-600 p-3 rounded-none flex-1 font-bold text-xs flex justify-center items-center border border-blue-200">
                                        Your Post
                                    </div>
                                    <button onClick={() => handleDeleteRide(ride.id)} className="bg-red-50 text-red-500 p-3 rounded-none w-12 flex justify-center items-center border border-red-100 hover:bg-red-100">
                                        <FaTrash />
                                    </button>
                                </div>
                            ) : (
                                isFull ? (
                                    <button disabled className="bg-gray-100 text-gray-400 p-3 rounded-none flex-[2] font-bold text-xs cursor-not-allowed border border-gray-200">
                                        Seats Full
                                    </button>
                                ) : (
                                    <button onClick={() => openJoinModal(ride)} className="bg-gray-900 text-white p-3 rounded-none flex-[2] font-bold text-xs shadow-lg active:scale-95 transition-transform">
                                        Join Ride
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )})
            )}
        </div>
      )}


      {/* --- CONTENT: BOOK CAB (UPDATED UI) --- */}
      {activeTab === 'book' && (
        <div className="px-4 animate-in fade-in">
            <div className="bg-white p-6 rounded-none shadow-sm border border-gray-100 relative">
                
                {/* MY BOOKINGS BUTTON */}
                <button 
                    onClick={() => setShowMyBookings(true)} 
                    className="absolute top-6 right-6 text-orange-500 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-orange-100"
                >
                    <FaHistory /> My Rides
                </button>


                <h2 className="text-xl font-black text-gray-800 mb-4 italic">Book Auto/Cab</h2>
                
                {/* Route Select */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Select Route</label>
                    <div className="relative mt-1">
                        <select value={cabRoute} onChange={(e) => setCabRoute(e.target.value)} className="w-full p-4 bg-gray-50 rounded-none font-bold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-200">
                            <option value="raja_park">LNMIIT ↔ Raja Park</option>
                            <option value="ajmeri_gate">LNMIIT ↔ Ajmeri Gate</option>
                            <option value="airport">LNMIIT ↔ Airport</option>
                            <option value="sanganer">LNMIIT ↔ Sanganer</option>
                            <option value="durgapura">LNMIIT ↔ Durgapura</option>
                            <option value="junction">LNMIIT ↔ Jaipur Junction</option>
                            <option value="other">Other Location...</option>
                        </select>
                        <FaMapMarkerAlt className="absolute right-4 top-4 text-orange-400" />
                    </div>
                    {/* Other Location Input */}
                    {cabRoute === 'other' && (
                        <input 
                            type="text" 
                            placeholder="Enter Destination..." 
                            value={customDestination}
                            onChange={(e) => setCustomDestination(e.target.value)}
                            className="w-full mt-2 p-3 bg-white border-2 border-orange-100 rounded-none font-bold text-sm focus:outline-none focus:border-orange-400"
                        />
                    )}
                </div>


                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Passengers</label>
                    <div className="flex items-center gap-4 mt-1 bg-gray-50 p-2 rounded-none">
                        <button onClick={() => setCabPax(Math.max(1, cabPax-1))} className="w-10 h-10 bg-white rounded-none shadow-sm font-black text-gray-600">-</button>
                        <span className="font-black text-xl flex-1 text-center">{cabPax}</span>
                        <button onClick={() => setCabPax(Math.min(6, cabPax+1))} className="w-10 h-10 bg-orange-500 text-white rounded-none shadow-sm font-black">+</button>
                    </div>
                </div>


                {/* 🔴 NEW: PHONE NUMBER INPUT */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Your Mobile Number (Required)</label>
                    <input 
                        type="number" 
                        placeholder="Driver will call you here..." 
                        value={cabPhone}
                        onChange={(e) => setCabPhone(e.target.value)}
                        className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-none font-bold text-sm focus:outline-none focus:border-orange-400"
                    />
                </div>


                {/* 🔴 UPDATED: ADVANCE PRICE BREAKDOWN */}
                <div className="bg-orange-50 p-4 rounded-none border border-orange-100 mb-6">
                    <p className="text-[10px] font-bold text-orange-400 uppercase mb-2">Fare Breakdown</p>
                    
                    <div className="flex justify-between items-center mb-1 border-b border-orange-200 pb-2">
                        <span className="text-xs font-bold text-gray-600">Total Fare</span>
                        <span className="text-sm font-black text-gray-800">
                             {cabRoute === 'other' ? "On Call" : `₹${calculatedPrice}`}
                        </span>
                    </div>
                    
                    {cabRoute !== 'other' && (
                        <>
                            <div className="flex justify-between items-center mb-1 mt-2 text-teal-700">
                                <span className="text-xs font-bold">Pay Now (Advance)</span>
                                <span className="text-sm font-black">- ₹100</span>
                            </div>
                            <div className="flex justify-between items-center text-red-600">
                                <span className="text-xs font-bold">Pay Driver (Cash/UPI)</span>
                                <span className="text-lg font-black">₹{Math.max(0, calculatedPrice - 100)}</span>
                            </div>
                        </>
                    )}
                </div>


                <button onClick={handleBookCab} disabled={isBooking} className="w-full bg-gray-900 text-white py-4 rounded-none font-bold text-sm shadow-xl flex justify-center gap-2">
                    {isBooking ? "Requesting..." : <>Request Booking (Pay ₹100) <FaArrowRight/></>}
                </button>
                
                {/* Emergency Contact */}
                <div className="mt-4 p-3 bg-red-50 rounded-none border border-red-100 text-center">
                    <p className="text-[10px] font-bold text-red-400 uppercase">Emergency / Immediate Booking</p>
                    <p className="text-lg font-black text-red-600 flex items-center justify-center gap-2">
                        <FaPhoneAlt size={14} /> 9256002697
                    </p>
                </div>
            </div>
        </div>
      )}


      {/* --- MODAL: CREATE RIDE (Unchanged) --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-none p-6 animate-slide-up">
                <h2 className="text-xl font-bold mb-4">Post a Ride</h2>
                <input type="text" placeholder="From (e.g. BH1)" className="w-full p-3 bg-gray-50 rounded-none mb-3 font-bold text-sm" value={newRide.from} onChange={(e) => setNewRide({...newRide, from: e.target.value})} />
                <input type="text" placeholder="To (e.g. Raja Park)" className="w-full p-3 bg-gray-50 rounded-none mb-3 font-bold text-sm" value={newRide.to} onChange={(e) => setNewRide({...newRide, to: e.target.value})} />
                <input type="text" placeholder="Your Roll No (Must)" className="w-full p-3 bg-blue-50 text-blue-900 rounded-none mb-3 font-bold text-sm border border-blue-100" value={newRide.creatorRoll} onChange={(e) => setNewRide({...newRide, creatorRoll: e.target.value})} />
                <input type="number" placeholder="Your Mobile Number (Must)" className="w-full p-3 bg-green-50 text-green-900 rounded-none mb-3 font-bold text-sm border border-green-100" value={shareRidePhone} onChange={(e) => setShareRidePhone(e.target.value)} />
                <div className="flex gap-2 mb-3">
                    <input type="date" className="flex-1 p-3 bg-gray-50 rounded-none font-bold text-sm" onChange={(e) => setNewRide({...newRide, date: e.target.value})} />
                    <input type="time" className="flex-1 p-3 bg-gray-50 rounded-none font-bold text-sm" onChange={(e) => setNewRide({...newRide, time: e.target.value})} />
                </div>
                <div className="flex gap-2 mb-4">
                    <select className="flex-1 p-3 bg-gray-50 rounded-none font-bold text-sm" onChange={(e) => setNewRide({...newRide, mode: e.target.value})}>
                        <option value="Cab">Cab</option>
                        <option value="Auto">Auto</option>
                        <option value="Bike">Bike</option>
                    </select>
                    <input type="number" placeholder="Seats" className="flex-1 p-3 bg-gray-50 rounded-none font-bold text-sm" value={newRide.seats} onChange={(e) => setNewRide({...newRide, seats: e.target.value})} />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-none bg-gray-100 font-bold text-gray-500">Cancel</button>
                    <button onClick={handleCreateRide} className="flex-1 py-3 rounded-none bg-teal-600 text-white font-bold">Post</button>
                </div>
            </div>
        </div>
      )}


      {/* --- MODAL: JOIN RIDE (Unchanged) --- */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-none p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-2">Join Ride</h2>
                <p className="text-xs text-gray-400 mb-4 font-bold">Going to: {selectedRide?.to}</p>
                <div className="mb-4">
                    <label className="text-xs font-bold text-gray-400">Seats Required</label>
                    <div className="flex gap-2 mt-1">
                        {[1, 2, 3, 4].map(num => (
                            <button key={num} onClick={() => handlePaxChange(num)} disabled={num > selectedRide?.availableSeats} className={`w-10 h-10 rounded-none font-black ${joinPaxCount === num ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-400'} ${num > selectedRide?.availableSeats ? 'opacity-30 cursor-not-allowed' : ''}`}>{num}</button>
                        ))}
                    </div>
                </div>
                <div className="space-y-4 mb-6">
                    {joinDetails.map((passenger, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-none border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Passenger {idx + 1}</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-white p-2 rounded-none border border-gray-200">
                                    <FaUser className="text-gray-300"/>
                                    <input type="text" placeholder="Full Name" className="w-full text-sm font-bold outline-none" value={passenger.name} onChange={(e) => handleJoinInput(idx, 'name', e.target.value)} />
                                </div>
                                <div className="flex items-center gap-2 bg-white p-2 rounded-none border border-gray-200">
                                    <FaIdCard className="text-gray-300"/>
                                    <input type="text" placeholder="Roll No" className="w-full text-sm font-bold outline-none" value={passenger.roll} onChange={(e) => handleJoinInput(idx, 'roll', e.target.value)} />
                                </div>
                                <div className="flex items-center gap-2 bg-white p-2 rounded-none border border-gray-200">
                                    <FaPhoneAlt className="text-gray-300"/>
                                    <input type="tel" placeholder="Phone Number" className="w-full text-sm font-bold outline-none" value={passenger.phone} onChange={(e) => handleJoinInput(idx, 'phone', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowJoinModal(false)} className="flex-1 py-3 rounded-none bg-gray-100 font-bold text-gray-500">Cancel</button>
                    <button onClick={handleJoinSubmit} className="flex-1 py-3 rounded-none bg-gray-900 text-white font-bold shadow-xl">Confirm Join</button>
                </div>
            </div>
        </div>
      )}


      {/* --- MODAL: MY CAB BOOKINGS (UPDATED UI) --- */}
      {showMyBookings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-none p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">My Cab/Auto Requests</h2>
                    <button onClick={() => setShowMyBookings(false)} className="bg-gray-100 px-4 py-2 rounded-full font-bold text-xs">Close</button>
                </div>
                
                {myCabBookings.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No bookings yet.</p>
                ) : (
                    <div className="space-y-3">
                        {myCabBookings.map(booking => (
                            <div key={booking.id} className="bg-gray-50 p-4 rounded-none border border-gray-100">
                                <div className="flex justify-between mb-1">
                                    <h3 className="font-bold text-gray-800 text-sm">{booking.route.replace('_', ' ')}</h3>
                                    <span className={`px-2 py-0.5 rounded text-none font-black uppercase ${getStatusColor(booking.status)}`}>{booking.status}</span>
                                </div>
                                
                                {/* 🔴 UPDATED: PRICE DISPLAY IN HISTORY */}
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{booking.passengers} Passengers</span>
                                    <span className="font-bold">Total: ₹{booking.totalPrice}</span>
                                </div>
                                <div className="mt-1 flex justify-between text-[10px] font-bold uppercase">
                                    <span className="text-teal-600">Paid: ₹{booking.advancePaid || 0}</span>
                                    <span className="text-red-500">Due: ₹{booking.balanceDue || 0}</span>
                                </div>


                                <p className="text-[10px] text-gray-400 mt-2">
                                    {booking.timestamp?.seconds ? new Date(booking.timestamp.seconds * 1000).toLocaleString() : "Just now"}
                                </p>
                                
                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                    <button 
                                        onClick={() => initiateCancel(booking)}
                                        className="w-full mt-3 py-2 bg-white border border-red-200 text-red-500 rounded-none text-xs font-bold hover:bg-red-50"
                                    >
                                        Cancel Ride
                                    </button>
                                )}
                                {booking.status === 'cancelled' && (
                                     <p className="text-[10px] text-red-400 mt-2 font-bold bg-red-50 p-2 rounded">
                                        Cancelled: {booking.cancelReason}
                                     </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}


      {/* 🟢 NEW: CHAT MODAL */}
      {chatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-none p-6 animate-slide-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Chat with {chatModal.creatorName}</h2>
                    <button onClick={closeChat} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-none mb-4 border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Route Details</p>
                    <p className="text-sm font-bold text-gray-800">Going to: {chatModal.to}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-none mb-4 border border-green-200">
                    <p className="text-[10px] font-bold text-green-600 uppercase mb-2">Contact Number</p>
                    <p className="text-lg font-black text-green-700 flex items-center gap-2">
                        <FaPhoneAlt /> {chatModal.creatorPhone}
                    </p>
                </div>

                <div className="space-y-2 mb-4">
                    {/* ... inside the Chat Modal ... */}

<a 
  href={`https://wa.me/${
    chatModal.creatorPhone.replace(/\D/g, '').length === 10 
      ? '91' + chatModal.creatorPhone.replace(/\D/g, '')  // Adds 91 if missing
      : chatModal.creatorPhone.replace(/\D/g, '')         // Uses number as-is if code exists
  }?text=Hi ${chatModal.creatorName}, I saw your ride to ${chatModal.to} on LNM-Verse. Are you still going?`} 
  target="_blank" 
  rel="noreferrer" 
  className="w-full bg-green-500 text-white p-3 rounded-none font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
>
    <FaWhatsapp size={18} /> Chat on WhatsApp
</a>
                    <button onClick={() => {
                        const tel = `tel:${chatModal.creatorPhone}`;
                        window.location.href = tel;
                    }} className="w-full bg-blue-500 text-white p-3 rounded-none font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                        <FaPhoneAlt size={18} /> Call Directly
                    </button>
                </div>

                <button onClick={closeChat} className="w-full bg-gray-200 text-gray-700 p-3 rounded-none font-bold text-sm hover:bg-gray-300 transition-colors">
                    Close
                </button>
            </div>

            
        </div>
      )}


      {/* --- MODAL: CANCELLATION LOGIC (Unchanged) --- */}
      {cancelModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xs rounded-none p-5 animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Cancel Ride?</h3>
                  
                  {cancelModal.status === 'pending' && (
                      <div>
                          <p className="text-xs text-gray-500 mb-3">Please tell us why you are cancelling.</p>
                          <select 
                            className="w-full bg-gray-50 p-2 rounded-none text-sm border border-gray-200 mb-3 outline-none"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                          >
                              {CANCELLATION_REASONS.map((r,i) => <option key={i} value={r}>{r}</option>)}
                          </select>
                          <div className="bg-green-50 p-3 rounded-none border border-green-100 mb-4">
                              <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Refund Policy</p>
                              <p className="text-xs text-gray-700">Don't worry! Your advance booking amount (₹100) will be fully refunded shortly (2-3 days).</p>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => setCancelModal(null)} className="flex-1 py-2 bg-gray-100 rounded-none font-bold text-xs">Back</button>
                              <button onClick={submitCancellation} className="flex-1 py-2 bg-red-500 text-white rounded-none font-bold text-xs">Confirm Cancel</button>
                          </div>
                      </div>
                  )}


                  {cancelModal.status === 'confirmed' && (
                      <div>
                          <div className="bg-red-50 p-3 rounded-none border border-red-100 mb-3 flex gap-2 items-start">
                              <FaExclamationTriangle className="text-red-500 mt-1 min-w-[16px]" />
                              <div>
                                  <p className="text-xs font-bold text-red-600">Cancellation Fee Applies</p>
                                  <p className="text-[10px] text-red-400">Since the driver was assigned, a penalty of <b>₹20</b> will be deducted.</p>
                              </div>
                          </div>
                          <select 
                            className="w-full bg-gray-50 p-2 rounded-none text-sm border border-gray-200 mb-3 outline-none"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                          >
                              {CANCELLATION_REASONS.map((r,i) => <option key={i} value={r}>{r}</option>)}
                          </select>
                          <div className="flex items-start gap-2 mb-4 p-2">
                              <input 
                                type="checkbox" 
                                id="agreeCheck" 
                                checked={agreePenalty}
                                onChange={(e) => setAgreePenalty(e.target.checked)}
                                className="mt-1"
                              />
                              <label htmlFor="agreeCheck" className="text-xs text-gray-600 leading-tight">
                                  I agree to the cancellation fee. Refund (-₹20) will be processed in 2-3 days.
                              </label>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => setCancelModal(null)} className="flex-1 py-2 bg-gray-100 rounded-none font-bold text-xs">Back</button>
                              <button 
                                onClick={submitCancellation} 
                                disabled={!agreePenalty}
                                className={`flex-1 py-2 rounded-none font-bold text-xs text-white ${agreePenalty ? 'bg-red-500' : 'bg-gray-300 cursor-not-allowed'}`}
                              >
                                  Cancel Ride
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}


    </div>
  );
};



export default Rides;
