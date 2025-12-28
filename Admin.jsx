import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getDocs, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheck, FaTimes, FaMotorcycle, FaCheckDouble, FaClock, FaUtensils, FaStore, FaSignOutAlt, FaCut, FaMapMarkerAlt, FaPhoneAlt, FaWalking, FaChair, FaTaxi, FaTshirt, FaMoneyBillWave, FaSearch, FaUser, FaPlus, FaSave, FaEdit } from 'react-icons/fa';

const Admin = () => {
  const navigate = useNavigate();
  const { shopId } = useParams(); 
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- LAUNDRY SPECIFIC STATE ---
  const [laundryTokenSearch, setLaundryTokenSearch] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [editWashesMode, setEditWashesMode] = useState(false);
  const [newWashesValue, setNewWashesValue] = useState("");

  useEffect(() => {
    if (!shopId) return;

    let q;
    // 1. COLLECTION SELECTION (NEW LOGIC)
    if (shopId === 'taxi_service') {
        q = query(collection(db, "cab_bookings"), orderBy("timestamp", "desc"));
    } else if (shopId === 'laundry_service') {
        q = query(collection(db, "laundry_orders"), orderBy("timestamp", "desc"));
    } else {
        q = query(
            collection(db, "orders"), 
            where("shopId", "==", shopId),
            orderBy("timestamp", "desc")
        );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [shopId]);

  // --- LAUNDRY ACTIONS (NO POPUPS) ---
  const handleSearchUser = async () => {
      if(!laundryTokenSearch) return;
      setIsSearchingUser(true);
      setFoundUser(null);
      setEditWashesMode(false);
      try {
          const q = query(collection(db, "users"), where("laundryToken", "==", laundryTokenSearch));
          const snap = await getDocs(q);
          if(!snap.empty) {
              const userDoc = snap.docs[0];
              const userData = userDoc.data();
              setFoundUser({ id: userDoc.id, ...userData });
              setNewWashesValue(userData.washesLeft || 0);
          } 
          // 🔴 HATA DIYA: "No user found" wala popup ab nahi aayega.
      } catch(e) { console.error(e); }
      setIsSearchingUser(false);
  };

  const handleUpdateWashes = async () => {
      if(!foundUser) return;
      try {
          await updateDoc(doc(db, "users", foundUser.id), { washesLeft: parseInt(newWashesValue) });
          setFoundUser({ ...foundUser, washesLeft: parseInt(newWashesValue) });
          setEditWashesMode(false);
          // 🔴 SILENT UPDATE: Koi popup nahi aayega update par.
      } catch(e) { console.error(e); }
  };

  const handleAddWash = async () => {
      if(!foundUser) return;
      if((foundUser.washesLeft || 0) <= 0) return alert("Zero washes left! Recharge first.");
      
      // Safety Confirmation zaroori hai galti se click na ho jaye
      if(window.confirm(`Start wash for ${foundUser.name}? (-1 Wash)`)) {
          try {
              await addDoc(collection(db, "laundry_orders"), {
                  userId: foundUser.id, userName: foundUser.name, room: foundUser.room || "N/A", hostel: foundUser.hostel || "N/A", token: foundUser.laundryToken, clothCount: "Standard Load", status: "accepted", timestamp: serverTimestamp(), shopId: 'laundry_service'
              });
              await updateDoc(doc(db, "users", foundUser.id), { washesLeft: increment(-1) });
              setFoundUser({ ...foundUser, washesLeft: foundUser.washesLeft - 1 });
              // 🔴 SILENT ADD: Wash add hone par popup nahi aayega.
          } catch(e) { console.error(e); }
      }
  };

  const updateStatus = async (orderId, newStatus) => {
    let collectionName = "orders";
    if (shopId === 'taxi_service') collectionName = "cab_bookings";
    if (shopId === 'laundry_service') collectionName = "laundry_orders";
    try { await updateDoc(doc(db, collectionName, orderId), { status: newStatus }); } catch (e) { alert("Update failed"); }
  };

  const handleLogout = () => {
    if(window.confirm("Logout?")) { auth.signOut(); navigate('/welcome'); }
  };

  // --- STATS CALCULATIONS (OLD LOGIC RESTORED FOR STANDARD SHOPS) ---
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => ['pending', 'preparing', 'accepted', 'ready'].includes(o.status));
  const totalIncome = completedOrders.reduce((sum, o) => sum + (Number(o.totalAmount || o.totalPrice) || 0), 0);
  const showGST = shopId === 'shop_kravers';
  const totalGST = Math.round(totalIncome * 0.05);

  const isTaxi = shopId === 'taxi_service';
  const isLaundry = shopId === 'laundry_service';
  const isSalon = shopId === 'shop_salon';
  const shopDisplayName = shopId?.replace('shop_', '').replace(/_/g, ' ').toUpperCase();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-800 font-black animate-pulse">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      
      {/* HEADER */}
      <div className="bg-[#0f4c3a] text-white p-6 rounded-none shadow-xl sticky top-0 z-50">
        <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest flex items-center gap-1">
                    <FaStore className="text-orange-400" /> Merchant Panel
                </p>
                <h1 className="text-2xl font-black italic">{shopDisplayName}</h1>
            </div>
            <button onClick={handleLogout} className="bg-white/10 p-3 rounded-none hover:bg-red-500 transition-all">
                <FaSignOutAlt size={20} />
            </button>
        </div>

        {/* --- LAUNDRY SEARCH UI (NEW) --- */}
        {isLaundry && (
            <div className="bg-white p-4 rounded-none shadow-lg border-l-4 border-blue-500 text-gray-800 mb-2 animate-in slide-in-from-top-4">
                <h3 className="font-black text-sm uppercase mb-3 flex items-center gap-2 text-blue-800"><FaPlus/> New Wash Entry</h3>
                <div className="flex gap-2 mb-3">
                    <input type="text" placeholder="Enter Token No." className="flex-1 bg-gray-100 p-2 text-sm font-bold outline-none border border-gray-300 focus:border-blue-500 rounded-none" value={laundryTokenSearch} onChange={(e) => setLaundryTokenSearch(e.target.value)} />
                    <button onClick={handleSearchUser} disabled={isSearchingUser} className="bg-blue-600 text-white px-4 font-bold uppercase text-xs hover:bg-blue-700 rounded-none">{isSearchingUser ? "..." : <FaSearch />}</button>
                </div>
                {foundUser && (
                    <div className="bg-blue-50 p-3 border border-blue-100">
                        <div className="flex justify-between items-start mb-3 border-b border-blue-200 pb-2">
                            <div><p className="text-lg font-black text-gray-800">{foundUser.name}</p><p className="text-xs text-gray-500 font-bold uppercase">{foundUser.hostel} • Room {foundUser.room}</p></div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Washes Left</p>
                                {editWashesMode ? (
                                    <div className="flex items-center gap-1 mt-1 justify-end"><input type="number" className="w-12 p-1 text-sm font-bold border border-blue-300 outline-none" value={newWashesValue} onChange={(e) => setNewWashesValue(e.target.value)} /><button onClick={handleUpdateWashes} className="bg-green-600 text-white p-1.5 rounded-sm"><FaSave size={10}/></button><button onClick={() => setEditWashesMode(false)} className="bg-red-500 text-white p-1.5 rounded-sm"><FaTimes size={10}/></button></div>
                                ) : (
                                    <div className="flex items-center gap-2 justify-end"><p className={`text-2xl font-black ${foundUser.washesLeft > 0 ? 'text-blue-600' : 'text-red-500'}`}>{foundUser.washesLeft || 0}</p><button onClick={() => setEditWashesMode(true)} className="text-gray-400 hover:text-blue-600"><FaEdit size={12}/></button></div>
                                )}
                            </div>
                        </div>
                        <button onClick={handleAddWash} className={`w-full py-3 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 ${foundUser.washesLeft > 0 ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}><FaTshirt /> Start Wash (-1 Credit)</button>
                    </div>
                )}
            </div>
        )}

        {/* --- STATS UI (OLD - ONLY FOR STANDARD SHOPS) --- */}
        {!isLaundry && !isTaxi && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-none border border-white/5"><p className="text-[10px] font-bold uppercase opacity-60 mb-1">Total Revenue</p><h2 className="text-xl font-black">₹{totalIncome}</h2></div>
                {showGST && (<div className="bg-white/10 backdrop-blur-md p-4 rounded-none border border-white/5"><p className="text-[10px] font-bold uppercase opacity-60 mb-1">Total GST (5%)</p><h2 className="text-xl font-black text-yellow-400">₹{totalGST}</h2></div>)}
                <div className="bg-orange-500 p-4 rounded-none shadow-lg shadow-orange-500/20"><p className="text-[10px] font-bold uppercase opacity-80 mb-1">Pending</p><h2 className="text-xl font-black">{pendingOrders.length}</h2></div>
                <div className="bg-green-600 p-4 rounded-none shadow-lg shadow-green-600/20"><p className="text-[10px] font-bold uppercase opacity-80 mb-1">Completed</p><h2 className="text-xl font-black">{completedOrders.length}</h2></div>
            </div>
        )}
      </div>

      {/* ORDERS LIST */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 ml-2">Active Orders</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
                
                // 1. TAXI CARD (NEW UI + FIX: Phone & Pax)
                if (isTaxi) {
                    return (
                        <div key={order.id} className="bg-white p-5 rounded-none shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div><h4 className="font-black text-gray-800 text-lg leading-tight">{order.userName}</h4><span className="text-[10px] bg-gray-100 px-2 py-1 rounded-none font-bold text-gray-500 mt-1 inline-block">#{order.id.slice(-4)}</span></div>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{order.status}</span>
                            </div>
                            <div className="flex flex-col gap-2 mb-4 bg-gray-50 p-3 rounded-none border border-gray-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                    <FaTaxi className="text-yellow-500"/>
                                    {/* 👇 FIX: 'passengers' check karega */}
                                    <span className="uppercase">{order.route} ({order.passengers || order.pax || 1} Pax)</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <FaPhoneAlt className="text-teal-600" size={10} />
                                    {/* 👇 FIX: 'contactNumber' check karega */}
                                    <span className="font-mono">{order.contactNumber || order.phone || 'No Phone'}</span>
                                    {(order.contactNumber || order.phone) && <a href={`tel:${order.contactNumber || order.phone}`} className="ml-auto text-[9px] bg-black text-white px-2 py-0.5 uppercase">Call</a>}
                                </div>
                                <div className="mt-2 bg-yellow-50 border border-yellow-200 p-2"><div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase"><span>Total:</span><span>₹{order.totalPrice}</span></div><div className="flex justify-between text-[10px] font-bold text-green-600 uppercase"><span>Paid:</span><span>- ₹{order.advancePaid || 100}</span></div><div className="flex justify-between text-xs font-black text-red-600 uppercase border-t border-yellow-200 pt-1 mt-1"><span>Collect:</span><span>₹{order.balanceDue || (order.totalPrice - 100)}</span></div></div>
                            </div>
                            <div className="flex gap-2">
                                {order.status === 'pending' && <button onClick={() => updateStatus(order.id, 'confirmed')} className="w-full py-3 bg-black text-white font-bold text-xs">Confirm Ride</button>}
                                {order.status === 'confirmed' && <button onClick={() => updateStatus(order.id, 'completed')} className="w-full py-3 bg-green-600 text-white font-bold text-xs"><FaMoneyBillWave/> Finish & Collect Cash</button>}
                                {order.status === 'completed' && <div className="w-full py-2 bg-gray-50 text-gray-400 text-center text-[10px] font-black uppercase tracking-widest">Trip Finished</div>}
                            </div>
                        </div>
                    );
                }

                // 2. LAUNDRY CARD (NEW UI)
                if (isLaundry) {
                    return (
                        <div key={order.id} className="bg-white p-5 rounded-none shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div><h4 className="font-black text-gray-800 text-lg leading-tight">{order.userName}</h4><span className="text-[10px] bg-gray-100 px-2 py-1 rounded-none font-bold text-gray-500 mt-1 inline-block">#{order.id.slice(-4)}</span></div>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${order.status === 'collected' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{order.status}</span>
                            </div>
                            <div className="mb-4 bg-gray-50 p-3 rounded-none border border-gray-100 text-xs font-bold text-blue-800">
                                <div className="flex justify-between mb-1"><span>Token: {order.token}</span><span>Room: {order.room}</span></div>
                                <div className="bg-white p-2 border border-blue-100 text-[10px] uppercase text-gray-500 flex items-center gap-2"><FaClock /> Status: {order.status}</div>
                            </div>
                            <div className="flex gap-2">
                                {order.status === 'accepted' && <button onClick={() => updateStatus(order.id, 'washing')} className="w-full py-3 bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2"><FaTshirt/> Start Wash</button>}
                                {order.status === 'washing' && <button onClick={() => updateStatus(order.id, 'ready')} className="w-full py-3 bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 animate-pulse"><FaClock/> Mark Ready</button>}
                                {order.status === 'ready' && <button onClick={() => updateStatus(order.id, 'collected')} className="w-full py-3 bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-2"><FaCheckDouble/> Mark Collected</button>}
                                {order.status === 'collected' && <div className="w-full py-2 bg-gray-50 text-gray-400 text-center text-[10px] font-black uppercase tracking-widest">Order Closed</div>}
                            </div>
                        </div>
                    );
                }

                // 3. STANDARD SHOPS (FOOD/SALON) - OLD UI RESTORED 100%
                return (
                    <div key={order.id} className="bg-white p-5 rounded-none shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-black text-gray-800 text-lg leading-tight">{order.customerName}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-none font-bold text-gray-500">#{order.id.slice(-4)}</span>
                                    {order.orderCategory === 'group' && <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-none font-bold italic">Group Order</span>}
                                </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-600' : order.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 mb-4 bg-gray-50 p-3 rounded-none border border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><FaPhoneAlt className="text-teal-600" size={10} /><span>{order.customerPhone || 'No Phone'}</span></div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                {order.orderType === 'pickup' && <><FaWalking className="text-blue-500" size={12} /> <span className="uppercase">Takeaway</span></>}
                                {order.orderType === 'dinein' && <><FaChair className="text-purple-500" size={12} /> <span className="uppercase">Dine-In</span></>}
                                {order.orderType === 'delivery' && <><FaMotorcycle className="text-orange-500" size={12} /> <span className="uppercase">Delivery</span></>}
                                {order.orderType === 'appointment' && <><FaClock className="text-indigo-500" size={12} /> <span className="uppercase">Slot: {order.timeSlot}</span></>}
                            </div>
                            {order.orderType === 'delivery' && order.deliveryLocation && (<div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-1 rounded-none"><FaMapMarkerAlt size={10} /><span>{order.deliveryLocation}</span></div>)}
                        </div>

                        <div className="space-y-2 mb-6 flex-grow">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm items-center border-b border-dashed border-gray-100 pb-1 last:border-0">
                                    <span className="text-gray-700 font-medium"><span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded text-none font-black mr-2">{item.qty}x</span>{item.name} {item.variant && item.variant !== "Standard" && <span className="text-[10px] text-gray-400">({item.variant})</span>}</span>
                                    <span className="font-bold text-gray-400 text-xs">₹{item.price * item.qty}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-50"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bill Amount</span><span className="text-xl font-black text-[#0f4c3a]">₹{order.totalAmount}</span></div>
                            <div className="flex gap-2">
                                {order.status === 'pending' && (
                                    <>
                                        <button onClick={() => updateStatus(order.id, 'rejected')} className="flex-1 py-3 rounded-none bg-gray-50 text-red-500 font-bold text-xs hover:bg-red-50 transition-colors">Reject</button>
                                        <button onClick={() => updateStatus(order.id, 'accepted')} className="flex-1 py-3 rounded-none bg-[#0f4c3a] text-white font-bold text-xs shadow-lg shadow-teal-900/20">Accept</button>
                                    </>
                                )}
                                {order.status === 'accepted' && (
                                    <button onClick={() => updateStatus(order.id, 'preparing')} className="w-full py-3 rounded-none bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2">{isSalon ? <><FaCut /> Start Service</> : <><FaUtensils /> Start Preparing</>}</button>
                                )}
                                {order.status === 'preparing' && (
                                    <button onClick={() => updateStatus(order.id, 'ready')} className="w-full py-3 rounded-none bg-blue-600 text-white font-bold text-xs animate-pulse flex items-center justify-center gap-2">{isSalon ? <><FaCheck /> Service Done</> : <><FaClock /> Mark Ready</>}</button>
                                )}
                                {order.status === 'ready' && (
                                    <button onClick={() => updateStatus(order.id, 'completed')} className="w-full py-3 rounded-none bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-2"><FaCheckDouble /> Complete Order</button>
                                )}
                                {(order.status === 'completed' || order.status === 'rejected') && (
                                    <div className="w-full py-2 bg-gray-50 text-gray-400 text-center text-[10px] font-black rounded-none uppercase tracking-widest">Order Closed</div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default Admin;