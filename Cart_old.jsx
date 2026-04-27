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
















