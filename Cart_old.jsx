import React, { useState, useEffect } from 'react';
import { FaTimes, FaMotorcycle, FaWalking, FaUser, FaUserFriends, FaMapMarkerAlt } from 'react-icons/fa';

const Cart = ({ cartItems, onClose, onPlaceOrder }) => {
  
  // --- 1. USER DATA FETCH ---
  const savedName = localStorage.getItem('userName') || "";
  const savedPhone = localStorage.getItem('userPhone') || "";
  const savedHostel = localStorage.getItem('userHostel') || "";

  // --- 2. STATE ---
  const [orderFor, setOrderFor] = useState("self"); // Default: Khud ke liye
  const [orderType, setOrderType] = useState("pickup"); 
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryLoc, setDeliveryLoc] = useState("");

  // --- 3. AUTO-FILL LOGIC ---
  useEffect(() => {
    console.log("Mode Changed to:", orderFor); // Debugging ke liye
    if (orderFor === 'self') {
      setName(savedName);
      setPhone(savedPhone);
      if(orderType === 'delivery') setDeliveryLoc(savedHostel);
    } else {
      setName("");
      setPhone("");
      setDeliveryLoc("");
    }
  }, [orderFor, orderType, savedName, savedPhone, savedHostel]);

  // --- 4. BILLING CALCULATION ---
  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const gstAmount = Math.round(itemTotal * 0.05); 
  const platformFee = 5; 
  const deliveryFee = orderType === 'delivery' ? 20 : 0;
  const grandTotal = itemTotal + gstAmount + platformFee + deliveryFee;

  // --- 5. CHECKOUT ---
  const handleCheckout = () => {
    if (!name.trim()) { alert("Naam likhna zaruri hai!"); return; }
    if (!phone.trim() || phone.length < 10) { alert("Phone number sahi nahi hai."); return; }
    
    const finalOrderData = {
      items: cartItems,
      billDetails: { itemTotal, gstAmount, platformFee, deliveryFee, grandTotal },
      orderType,
      deliveryLocation: orderType === 'pickup' ? 'Canteen Counter' : deliveryLoc,
      customerName: name,
      customerPhone: phone,
      orderCategory: orderFor, 
      status: "pending",
      createdAt: new Date().toLocaleString()
    };
    onPlaceOrder(finalOrderData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-500">
            <FaTimes />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto p-5 space-y-6">

            {/* --- 🔥 TOGGLE SECTION --- */}
            <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
                <p className="text-xs font-bold text-teal-800 uppercase mb-2 text-center">Order Kiske Liye Hai?</p>
                <div className="flex gap-2">
                    <button 
                      onClick={() => setOrderFor('self')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        orderFor === 'self' ? 'bg-teal-600 text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                       <FaUser /> Myself
                    </button>
                    <button 
                      onClick={() => setOrderFor('other')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        orderFor === 'other' ? 'bg-teal-600 text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                       <FaUserFriends /> Others
                    </button>
                </div>
            </div>

            {/* --- DETAILS FORM --- */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase">
                    {orderFor === 'self' ? "Your Details (Auto-filled)" : "Enter Friend's Details"}
                </label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    readOnly={orderFor === 'self'}
                    className={`w-full p-3 rounded-lg border-2 font-medium outline-none ${orderFor === 'self' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-teal-500 text-gray-900'}`}
                />
                <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    readOnly={orderFor === 'self'}
                    className={`w-full p-3 rounded-lg border-2 font-medium outline-none ${orderFor === 'self' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white border-teal-500 text-gray-900'}`}
                />
            </div>

            {/* --- ORDER METHOD --- */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Delivery Method</label>
                <div className="flex gap-2">
                    <button onClick={() => setOrderType('pickup')} className={`flex-1 p-2 rounded-lg border-2 flex flex-col items-center justify-center gap-1 ${orderType === 'pickup' ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold' : 'border-gray-100 text-gray-400'}`}>
                        <FaWalking /> Takeaway
                    </button>
                    <button onClick={() => setOrderType('delivery')} className={`flex-1 p-2 rounded-lg border-2 flex flex-col items-center justify-center gap-1 ${orderType === 'delivery' ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold' : 'border-gray-100 text-gray-400'}`}>
                        <FaMotorcycle /> Delivery
                    </button>
                </div>
                
                {/* Delivery Location Input */}
                {orderType === 'delivery' && (
                    <div className="mt-2 flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <FaMapMarkerAlt className="text-teal-500 mr-2"/>
                        <input 
                            value={deliveryLoc}
                            onChange={(e) => setDeliveryLoc(e.target.value)}
                            placeholder="Room Number / Location"
                            className="bg-transparent w-full outline-none text-sm font-medium"
                        />
                    </div>
                )}
            </div>

            {/* --- TOTAL --- */}
            <div className="flex justify-between items-center pt-4 border-t border-dashed">
                <span className="text-gray-500 font-medium">Grand Total</span>
                <span className="text-2xl font-bold text-teal-700">₹{grandTotal}</span>
            </div>
        </div>

        {/* FOOTER BUTTON */}
        <div className="p-4 border-t bg-gray-50">
            <button onClick={handleCheckout} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-teal-700 active:scale-95 transition-transform">
                CONFIRM ORDER - ₹{grandTotal}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Cart;


// //import React, { useState, useEffect } from 'react';
// import { db } from '../firebase'; 
// import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'; 
// import { FaPlus, FaMinus, FaSearch, FaShoppingBag, FaArrowLeft, FaStore, FaCut, FaIceCream, FaGlassCheers, FaChevronRight, FaUtensils, FaMugHot, FaCheckCircle, FaMotorcycle, FaWalking, FaChair, FaClock, FaUser, FaPhone, FaUserFriends } from 'react-icons/fa';

// // --- BACKUP MENU ---
// const BACKUP_MENU = [
//     { id: "s1", shopId: "shop_salon", name: "Hair Cut (Men)", price: 100, category: "Grooming", hasVariants: false },
//     { id: "s2", shopId: "shop_salon", name: "Hair Cut (Women)", price: 200, category: "Grooming", hasVariants: false },
//     { id: "a1", shopId: "shop_amul", name: "Choco Bar", price: 20, category: "Ice Cream", hasVariants: false },
//     { id: "v1", shopId: "shop_vinayak", name: "Samosa", price: 15, category: "Snacks", hasVariants: false },
//     { id: "nb1", shopId: "shop_nescafe_bh4", name: "Maggi Plain", price: 30, category: "Maggi", hasVariants: false },
// ];

// // --- TIME SLOTS ---
// const TIME_SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];

// const Canteen = () => {
//   const [allMenuItems, setAllMenuItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [cart, setCart] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [orderPlaced, setOrderPlaced] = useState(false);
  
//   // --- NEW STATE FOR TOGGLE ---
//   const [orderFor, setOrderFor] = useState("self"); // 'self' or 'other'

//   // USER DETAILS STATE
//   const [userName, setUserName] = useState("");
//   const [userPhone, setUserPhone] = useState("");
//   const [isPlacingOrder, setIsPlacingOrder] = useState(false);

//   const [viewState, setViewState] = useState("MAIN_LIST"); 
//   const [selectedShopId, setSelectedShopId] = useState(null); 
//   const [selectedShopName, setSelectedShopName] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");

//   const [orderType, setOrderType] = useState("pickup"); 
//   const [deliveryLocation, setDeliveryLocation] = useState(""); 
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

//   // --- FETCH MENU ---
//   useEffect(() => {
//     const fetchMenu = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "menu"));
//         const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         if (items.length > 0) setAllMenuItems(items);
//         else setAllMenuItems(BACKUP_MENU);
//       } catch (error) {
//         console.error("Error fetching menu:", error);
//         setAllMenuItems(BACKUP_MENU); 
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMenu();
//   }, []);

//   // --- 🔥 AUTO-FILL LOGIC (Jab Checkout Khule) ---
//   useEffect(() => {
//     if (viewState === "CART_VIEW") {
//         if (orderFor === 'self') {
//             // Login wala data uthao
//             const savedName = localStorage.getItem('userName') || "";
//             const savedPhone = localStorage.getItem('userPhone') || "";
//             setUserName(savedName);
//             setUserPhone(savedPhone);
//         } else {
//             // Others ke liye khali karo
//             setUserName("");
//             setUserPhone("");
//         }
//     }
//   }, [viewState, orderFor]); // Jab View ya Toggle change ho tab run karo

//   // --- CART FUNCTIONS ---
//   const addToCart = (item, variant = null, price = null) => {
//     const cartId = variant ? `${item.id}_${variant}` : item.id;
//     const finalPrice = price || item.price;
//     const finalName = variant ? `${item.name} (${variant})` : item.name;

//     const existingItems = Object.values(cart);
//     if (existingItems.length > 0) {
//         if (existingItems[0].shopId !== item.shopId) {
//             if (window.confirm(`⚠️ Switching Shops!\n\nCart clear karke ${selectedShopName} se order karein?`)) {
//                 setCart({ [cartId]: { ...item, id: cartId, originalId: item.id, name: finalName, price: finalPrice, qty: 1, selectedVariant: variant, shopId: item.shopId } });
//                 setOrderType(item.shopId === "shop_salon" ? "appointment" : "pickup");
//                 setDeliveryLocation("");
//                 setSelectedTimeSlot("");
//             }
//             return;
//         }
//     }
//     setCart(prev => {
//       const currentQty = prev[cartId] ? prev[cartId].qty : 0;
//       return { ...prev, [cartId]: { ...item, id: cartId, originalId: item.id, name: finalName, price: finalPrice, qty: currentQty + 1, selectedVariant: variant, shopId: item.shopId } };
//     });
//   };

//   const removeFromCart = (cartId) => {
//     setCart(prev => {
//       if (!prev[cartId]) return prev;
//       if (prev[cartId].qty === 1) { const { [cartId]: _, ...rest } = prev; return rest; }
//       return { ...prev, [cartId]: { ...prev[cartId], qty: prev[cartId].qty - 1 } };
//     });
//   };

//   // --- CALCULATIONS ---
//   const cartItems = Object.values(cart);
//   const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
//   const itemTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
//   const currentShopId = cartItems.length > 0 ? cartItems[0].shopId : null;
//   const isKravers = currentShopId === "shop_kravers";
//   const isNescafeBH4 = currentShopId === "shop_nescafe_bh4";
//   const isSalon = currentShopId === "shop_salon";

//   let deliveryFee = 0;
//   if (orderType === 'delivery') {
//       if (isNescafeBH4) deliveryFee = 15;
//       else {
//           if (['BH1', 'BH2', 'BH3'].includes(deliveryLocation)) deliveryFee = 20;
//           if (['BH4', 'BH5'].includes(deliveryLocation)) deliveryFee = 30;
//       }
//   }
//   const gstAmount = isKravers ? Math.round(itemTotal * 0.05) : 0;
//   const platformFee = totalItems > 0 ? 3 : 0;
//   const grandTotal = itemTotal + deliveryFee + gstAmount + platformFee;

//   // --- PLACE ORDER ---
//   const placeOrder = async () => {
//       if (!userName.trim()) { alert("⚠️ Please enter your Name!"); return; }
//       if (!userPhone.trim() || userPhone.length < 10) { alert("⚠️ Please enter a valid Phone Number!"); return; }
//       if (orderType === 'delivery' && !deliveryLocation) { alert("⚠️ Please select a Hostel!"); return; }
//       if (orderType === 'appointment' && !selectedTimeSlot) { alert("⚠️ Please select a Time Slot!"); return; }

//       setIsPlacingOrder(true);

//       try {
//           const orderData = {
//               shopId: currentShopId,
//               shopName: selectedShopName,
//               customerName: userName,
//               customerPhone: userPhone,
//               items: cartItems.map(item => ({
//                   name: item.name,
//                   qty: item.qty,
//                   price: item.price,
//                   variant: item.selectedVariant || "Standard"
//               })),
//               totalAmount: grandTotal,
//               orderType: orderType,
//               deliveryLocation: deliveryLocation || "N/A",
//               timeSlot: selectedTimeSlot || "N/A",
//               orderCategory: orderFor, // 'self' or 'other' logic saved
//               status: "pending", 
//               timestamp: serverTimestamp(), 
//               createdAt: new Date().toLocaleString()
//           };

//           await addDoc(collection(db, "orders"), orderData);

//           setOrderPlaced(true);
//           setTimeout(() => { 
//               setCart({}); 
//               setOrderPlaced(false); 
//               setViewState("MAIN_LIST"); 
//               setSelectedShopId(null); 
//               setDeliveryLocation("");
//               setOrderType("pickup");
//               setSelectedTimeSlot("");
//               setUserName(""); 
//               setUserPhone("");
//               setOrderFor("self"); // Reset to self
//           }, 3000);

//       } catch (error) {
//           console.error("Error placing order:", error);
//           alert("❌ Order Failed! Check internet connection or API Key.");
//       } finally {
//           setIsPlacingOrder(false);
//       }
//   };

//   // --- HANDLERS ---
//   const openShop = (id, name) => {
//     setSelectedShopId(id);
//     setSelectedShopName(name);
//     setViewState("MENU_VIEW");
//     setSearchTerm("");
//     setSelectedCategory("All");
//     if (id === 'shop_salon') setOrderType("appointment");
//     else setOrderType("pickup");
//     setDeliveryLocation("");
//     setSelectedTimeSlot("");
//   };

//   const handleNescafeClick = () => setViewState("NESCAFE_SELECT");

//   const goBack = () => {
//     if (viewState === "CART_VIEW") setViewState("MENU_VIEW");
//     else if (viewState === "MENU_VIEW" && (selectedShopId === "shop_nescafe_bh4" || selectedShopId === "shop_nescafe_canteen")) setViewState("NESCAFE_SELECT");
//     else setViewState("MAIN_LIST");
//   };

//   const shopItems = allMenuItems.filter(item => item.shopId === selectedShopId);
//   const filteredItems = shopItems.filter(item => {
//     if (!item || !item.name) return false;
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });
//   const categories = ["All", ...new Set(shopItems.map(item => item.category))];

//   // ==========================================
//   // VIEW: ORDER SUCCESS
//   // ==========================================
//   if (orderPlaced) {
//       return (
//           <div className="min-h-screen bg-teal-600 flex flex-col items-center justify-center p-6 text-white text-center animate-fade-in">
//               <FaCheckCircle className="text-6xl mb-4 animate-bounce" />
//               <h1 className="text-3xl font-bold mb-2">{isSalon ? "Appointment Booked!" : "Order Placed!"}</h1>
//               <p className="text-teal-100 mb-6">Shopkeeper has received your request.</p>
//               <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm w-full max-w-xs">
//                   <p className="text-sm text-teal-100">Order ID Generated</p>
//                   <p className="font-mono text-lg font-bold">Waiting for confirmation...</p>
//               </div>
//           </div>
//       );
//   }

//   // ==========================================
//   // VIEW: CART / CHECKOUT
//   // ==========================================
//   if (viewState === "CART_VIEW") {
//       return (
//         <div className="min-h-screen bg-gray-50 pb-44 animate-slide-up">
//             <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
//                 <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><FaArrowLeft /></button>
//                 <h1 className="text-xl font-bold">Checkout</h1>
//             </div>

//             <div className="p-4 space-y-4">
                
//                 {/* --- 🔥 NEW: TOGGLE BUTTON (MYSELF vs OTHERS) --- */}
//                 <div className="bg-teal-50 p-1 rounded-xl flex border border-teal-100 shadow-sm">
//                     <button 
//                       onClick={() => setOrderFor('self')}
//                       className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${orderFor === 'self' ? 'bg-white text-teal-700 shadow-md transform scale-105' : 'text-teal-400 hover:bg-teal-100/50'}`}
//                     >
//                        <FaUser /> Myself
//                     </button>
//                     <button 
//                       onClick={() => setOrderFor('other')}
//                       className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${orderFor === 'other' ? 'bg-white text-teal-700 shadow-md transform scale-105' : 'text-teal-400 hover:bg-teal-100/50'}`}
//                     >
//                        <FaUserFriends /> Others
//                     </button>
//                 </div>

//                 {/* 1. USER DETAILS (Auto-Filled or Editable) */}
//                 <div className={`bg-white p-4 rounded-xl shadow-sm border transition-colors duration-300 ${orderFor === 'self' ? 'border-gray-100 bg-gray-50/50' : 'border-blue-200 ring-2 ring-blue-50'}`}>
//                     <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
//                         {orderFor === 'self' ? <FaUser className="text-gray-400"/> : <FaUserFriends className="text-blue-500"/>} 
//                         {orderFor === 'self' ? "Your Details (Auto-Filled)" : "Enter Friend's Details"}
//                     </h3>
//                     <div className="space-y-3">
//                         <div>
//                             <label className="text-[10px] text-gray-400 font-bold ml-1 uppercase">Name</label>
//                             <input 
//                                 type="text" 
//                                 placeholder="Enter Name" 
//                                 value={userName}
//                                 onChange={(e) => setUserName(e.target.value)}
//                                 readOnly={orderFor === 'self'}
//                                 className={`w-full p-3 rounded-lg border focus:outline-none transition-all font-medium ${orderFor === 'self' ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-blue-200 focus:border-blue-500 text-gray-800'}`}
//                             />
//                         </div>
//                         <div>
//                             <label className="text-[10px] text-gray-400 font-bold ml-1 uppercase">Phone Number</label>
//                             <div className={`flex items-center rounded-lg border transition-all ${orderFor === 'self' ? 'bg-gray-100 border-gray-200' : 'bg-white border-blue-200 focus-within:border-blue-500'}`}>
//                                 <span className="pl-3 text-gray-400"><FaPhone /></span>
//                                 <input 
//                                     type="number" 
//                                     placeholder="9876543210" 
//                                     value={userPhone}
//                                     onChange={(e) => setUserPhone(e.target.value)}
//                                     readOnly={orderFor === 'self'}
//                                     className={`w-full p-3 bg-transparent focus:outline-none font-medium ${orderFor === 'self' ? 'text-gray-500 cursor-not-allowed' : 'text-gray-800'}`}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 2. ORDER METHOD */}
//                 {!isSalon && (
//                 <div className="bg-white p-4 rounded-xl shadow-sm">
//                     <h3 className="font-bold text-gray-800 mb-3">Order Method</h3>
//                     <div className="flex gap-2">
//                         <button onClick={() => {setOrderType('pickup'); setDeliveryLocation("");}} className={`flex-1 py-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${orderType === 'pickup' ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold' : 'bg-gray-50 border-transparent text-gray-500'}`}>
//                             <FaWalking /> <span className="text-xs">Takeaway</span>
//                         </button>
//                         {isKravers && (
//                             <button onClick={() => {setOrderType('dinein'); setDeliveryLocation("");}} className={`flex-1 py-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${orderType === 'dinein' ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold' : 'bg-gray-50 border-transparent text-gray-500'}`}>
//                                 <FaChair /> <span className="text-xs">Dine-In</span>
//                             </button>
//                         )}
//                         <button onClick={() => setOrderType('delivery')} className={`flex-1 py-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${orderType === 'delivery' ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold' : 'bg-gray-50 border-transparent text-gray-500'}`}>
//                             <FaMotorcycle /> <span className="text-xs">Delivery</span>
//                         </button>
//                     </div>
//                     {orderType === 'delivery' && (
//                         <div className="mt-4 animate-fade-in">
//                             <label className="text-xs text-gray-500 font-bold ml-1">SELECT HOSTEL</label>
//                             <select value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} className="w-full mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-500">
//                                 <option value="">Select Location...</option>
//                                 {isNescafeBH4 ? <option value="BH4">Boys Hostel 4 (₹15)</option> : 
//                                 <>
//                                     <option value="BH1">Boys Hostel 1 (₹20)</option>
//                                     <option value="BH2">Boys Hostel 2 (₹20)</option>
//                                     <option value="BH3">Boys Hostel 3 (₹20)</option>
//                                     <option value="BH4">Boys Hostel 4 (₹30)</option>
//                                     <option value="BH5">Boys Hostel 5 (₹30)</option>
//                                 </>}
//                             </select>
//                         </div>
//                     )}
//                 </div>
//                 )}

//                 {/* SALON TIME SLOT */}
//                 {isSalon && (
//                      <div className="bg-white p-4 rounded-xl shadow-sm">
//                         <div className="flex items-center gap-2 mb-3 text-purple-700"><FaClock /><h3 className="font-bold">Select Appointment Time</h3></div>
//                         <div className="grid grid-cols-3 gap-2">
//                             {TIME_SLOTS.map((slot) => (
//                                 <button key={slot} onClick={() => setSelectedTimeSlot(slot)} className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${selectedTimeSlot === slot ? "bg-purple-600 text-white border-purple-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"}`}>{slot}</button>
//                             ))}
//                         </div>
//                      </div>
//                 )}
                
//                 {/* ITEMS LIST */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 divide-y divide-gray-100">
//                     {cartItems.map((item) => (
//                         <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
//                             <div><h3 className="font-bold text-gray-800">{item.name}</h3><p className="text-xs text-gray-400">₹{item.price} x {item.qty}</p></div>
//                             <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg">
//                                 <button onClick={() => removeFromCart(item.id)} className="text-red-500 font-bold"><FaMinus size={10} /></button>
//                                 <span className="font-bold text-sm">{item.qty}</span>
//                                 <button onClick={() => addToCart(item, item.selectedVariant, item.price)} className="text-green-600 font-bold"><FaPlus size={10} /></button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
                
//                 {/* BILL SUMMARY */}
//                 <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
//                     <h3 className="font-bold text-gray-800 mb-2">Bill Summary</h3>
//                     <div className="flex justify-between text-sm text-gray-500"><span>Item Total</span><span>₹{itemTotal}</span></div>
//                     <div className="flex justify-between text-sm text-gray-500"><span>Platform Fee</span><span>+ ₹{platformFee}</span></div>
//                     {orderType === 'delivery' && <div className="flex justify-between text-sm text-gray-500"><span>Delivery Fee</span><span>+ ₹{deliveryFee}</span></div>}
//                     {isKravers && <div className="flex justify-between text-sm text-gray-500"><span>GST (5%)</span><span>+ ₹{gstAmount}</span></div>}
//                     <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-lg text-gray-800"><span>Grand Total</span><span>₹{grandTotal}</span></div>
//                 </div>
//             </div>
            
//             {/* PAY BUTTON */}
//             <div className="fixed bottom-20 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-50">
//                 <button 
//                     onClick={placeOrder} 
//                     disabled={isPlacingOrder}
//                     className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex justify-between px-6 items-center active:scale-95 transition-all ${isPlacingOrder ? 'bg-gray-400' : (isSalon ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700')}`}
//                 >
//                     <span>{isPlacingOrder ? "Processing..." : `₹${grandTotal}`}</span>
//                     <span className="flex items-center gap-2">
//                         {isSalon ? "BOOK SLOT" : "PLACE ORDER"} <FaChevronRight />
//                     </span>
//                 </button>
//             </div>
//         </div>
//       );
//   }

//   // ==========================================
//   // VIEW: MAIN LIST & OTHERS (No Changes)
//   // ==========================================
//   if (viewState === "MAIN_LIST") {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6 pb-24">
//         <h1 className="text-3xl font-bold text-gray-800 mb-1">Canteen & Shops 🍔</h1>
//         <p className="text-gray-500 mb-6">Order food or book services</p>
//         <div className="flex flex-col gap-4">
//              <ShopRow onClick={() => openShop("shop_amul", "Amul Parlour")} icon={<FaIceCream />} color="blue" title="Amul Parlour" subtitle="Ice Cream & Dairy" />
//              <ShopRow onClick={() => openShop("shop_vinayak", "Vinayak Mishthan")} icon={<FaStore />} color="orange" title="Vinayak Mishthan" subtitle="Sweets, Snacks & Meals" />
//              <ShopRow onClick={() => openShop("shop_juice", "Juice Center")} icon={<FaGlassCheers />} color="green" title="Juice Center" subtitle="Fresh Juice & Shakes" />
//              <ShopRow onClick={() => openShop("shop_kravers", "Kravers Kitchen")} icon={<FaUtensils />} color="teal" title="Kravers Kitchen" subtitle="Burgers, Pasta & Indian" />
//              <ShopRow onClick={handleNescafeClick} icon={<FaMugHot />} color="red" title="Nescafe" subtitle="Hot Coffee, Maggi & Iced Tea" />
//              <ShopRow onClick={() => openShop("shop_salon", "Campus Salon")} icon={<FaCut />} color="purple" title="Campus Salon" subtitle="Haircut & Grooming" />
//         </div>
//       </div>
//     );
//   }

//   if (viewState === "NESCAFE_SELECT") {
//     return (
//       <div className="min-h-screen bg-red-50 p-6">
//         <button onClick={() => setViewState("MAIN_LIST")} className="mb-6 flex items-center gap-2 text-red-700 font-bold"><FaArrowLeft /> Back to List</button>
//         <h1 className="text-3xl font-bold text-red-900 mb-6">Select Nescafe Outlet ☕</h1>
//         <div className="flex flex-col gap-4">
//             <button onClick={() => openShop("shop_nescafe_bh4", "Nescafe (BH4)")} className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-red-600 hover:shadow-lg transition-all text-left">
//                 <h2 className="text-xl font-bold text-gray-800">BH4 Nescafe</h2><p className="text-gray-500 text-sm">Near Boys Hostel 4</p>
//             </button>
//             <button onClick={() => openShop("shop_nescafe_canteen", "Nescafe (Canteen)")} className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-red-600 hover:shadow-lg transition-all text-left">
//                 <h2 className="text-xl font-bold text-gray-800">Canteen Nescafe</h2><p className="text-gray-500 text-sm">Main Canteen Area</p>
//             </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-28">
//       <div className={`${isSalon ? 'bg-purple-600' : 'bg-teal-600'} text-white p-6 rounded-b-3xl shadow-lg sticky top-0 z-20`}>
//         <div className="flex items-center gap-3 mb-4">
//           <button onClick={goBack} className={`${isSalon ? 'bg-purple-700' : 'bg-teal-700'} p-2 rounded-lg hover:bg-opacity-80`}><FaArrowLeft /></button>
//           <div className="overflow-hidden"><h1 className="text-xl font-bold truncate">{selectedShopName}</h1><p className={`${isSalon ? 'text-purple-200' : 'text-teal-200'} text-xs`}>Menu</p></div>
//         </div>
//         <div className="relative"><input type="text" placeholder={`Search ${selectedShopName}...`} className="w-full p-3 pl-10 rounded-xl text-gray-800 shadow-inner focus:outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /><FaSearch className="absolute left-3 top-3.5 text-gray-400" /></div>
//       </div>
//       <div className="flex overflow-x-auto gap-3 p-4 scrollbar-hide">
//         {categories.map(cat => (
//           <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 whitespace-nowrap rounded-full text-sm font-bold shadow-sm transition-all ${selectedCategory === cat ? (isSalon ? 'bg-purple-600 text-white' : 'bg-teal-600 text-white') : 'bg-white text-gray-600'}`}>{cat}</button>
//         ))}
//       </div>
//       <div className="px-4 space-y-4">
//         {loading ? <p className="text-center mt-10">Loading...</p> : 
//          filteredItems.length === 0 ? <p className="text-center mt-10 text-gray-500">No items found.</p> : 
//          filteredItems.map(item => <MenuItem key={item.id} item={item} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} isSalon={isSalon} />)
//         }
//       </div>
//       {totalItems > 0 && (
//         <div onClick={() => setViewState("CART_VIEW")} className={`fixed bottom-20 left-4 right-4 ${isSalon ? 'bg-purple-800' : 'bg-teal-800'} text-white p-4 rounded-xl shadow-2xl flex justify-between items-center z-50 animate-bounce-short cursor-pointer hover:bg-opacity-90 transition-colors`}>
//           <div className="flex flex-col"><span className="font-bold text-lg">{totalItems} ITEMS</span><span className={`text-xs ${isSalon ? 'text-purple-200' : 'text-teal-200'}`}>View Cart & Checkout</span></div>
//           <div className="flex items-center gap-2"><span className="font-bold text-xl">₹{grandTotal}</span><FaShoppingBag /></div>
//         </div>
//       )}
//     </div>
//   );
// };

// const MenuItem = ({ item, cart, addToCart, removeFromCart, isSalon }) => {
//     const [selectedVariant, setSelectedVariant] = useState(item.hasVariants ? 'half' : null);
//     const currentPrice = item.hasVariants && item.variants ? item.variants[selectedVariant] : item.price;
//     const cartId = selectedVariant ? `${item.id}_${selectedVariant}` : item.id;
//     const quantityInCart = cart[cartId] ? cart[cartId].qty : 0;
//     return (
//         <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
//             <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                     <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h3><p className="text-gray-400 text-xs font-medium mb-1">{item.category}</p>
//                     {item.hasVariants && (
//                         <div className="flex gap-2 mt-2 mb-2">
//                             <button onClick={() => setSelectedVariant('half')} className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedVariant === 'half' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200'}`}>Half</button>
//                             <button onClick={() => setSelectedVariant('full')} className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedVariant === 'full' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200'}`}>Full</button>
//                         </div>
//                     )}
//                     <p className={`font-extrabold text-lg mt-1 ${isSalon ? 'text-purple-600' : 'text-teal-600'}`}>₹{currentPrice}</p>
//                 </div>
//                 <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
//                     {quantityInCart > 0 ? (
//                         <><button onClick={() => removeFromCart(cartId)} className="text-red-500"><FaMinus size={12} /></button><span className="font-bold text-gray-800 text-sm min-w-[15px] text-center">{quantityInCart}</span><button onClick={() => addToCart(item, selectedVariant, currentPrice)} className="text-green-600"><FaPlus size={12} /></button></>
//                     ) : (<button onClick={() => addToCart(item, selectedVariant, currentPrice)} className={`${isSalon ? 'text-purple-700' : 'text-teal-700'} font-bold text-sm px-1`}>ADD</button>)}
//                 </div>
//             </div>
//         </div>
//     );
// };

// const ShopRow = ({ onClick, icon, color, title, subtitle }) => {
//     const bgColors = { teal: "bg-teal-100 text-teal-600", amber: "bg-amber-100 text-amber-600", red: "bg-red-100 text-red-600", orange: "bg-orange-100 text-orange-600", green: "bg-green-100 text-green-600", blue: "bg-blue-100 text-blue-600", purple: "bg-purple-100 text-purple-600" };
//     return (
//         <button onClick={onClick} className={`w-full bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100 active:scale-95 ${bgColors[color].split(" ")[1] === "text-white" ? bgColors[color] : bgColors[color].replace("text-", "text-").replace("bg-", "bg-opacity-20 bg-")}`}>
//             <div className="flex items-center gap-4"><div className={`p-3 rounded-full text-xl ${bgColors[color]}`}>{icon}</div><div className="text-left"><h3 className="font-bold text-gray-800 text-lg">{title}</h3><p className="text-xs text-gray-400">{subtitle}</p></div></div><FaChevronRight className="text-gray-300" />
//         </button>
//     );
// }

// export default Canteen;














