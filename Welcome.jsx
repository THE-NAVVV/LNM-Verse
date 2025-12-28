import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaStore, FaChevronRight, FaArrowLeft } from 'react-icons/fa';

// Saari Shops ki List (IDs must match what you use in DB)
const SHOPS = [
  { id: 'shop_kravers', name: 'Kravers Kitchen', location: 'Main Canteen' },
  { id: 'shop_nescafe_bh4', name: 'Nescafe (BH4)', location: 'Hostel Area' },
  { id: 'shop_nescafe_canteen', name: 'Nescafe (Canteen)', location: 'Activity Center' },
  { id: 'shop_amul', name: 'Amul Parlour', location: 'Mess Area' },
  { id: 'shop_vinayak', name: 'Vinayak Mishthan', location: 'Central Plaza' },
  { id: 'shop_juice', name: 'Juice Center', location: 'Shopping Complex' },
  { id: 'shop_salon', name: 'Campus Salon', location: 'Shopping Complex' },
  { id: 'taxi_service', name: 'Campus Taxi & Auto', location: 'Main Gate / Transport' },
  { id: 'laundry_service', name: 'Quick Smart Wash Bh-4', location: 'BH-4 Basement' },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [showShops, setShowShops] = useState(false); // Toggle for Shop List

  const handleStudent = () => {
    localStorage.setItem('userRole', 'student');
    localStorage.removeItem('merchantShopId');
    navigate('/login');
  };

  const handleShopSelect = (shopId) => {
    localStorage.setItem('userRole', 'merchant');
    localStorage.setItem('merchantShopId', shopId); // Shop ID save kar li
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-teal-900 flex flex-col items-center justify-center p-6 text-white relative">
      
      {/* Background Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-teal-800 rounded-full blur-3xl opacity-50"></div>

      <div className="z-10 text-center mb-10">
        <h1 className="text-4xl font-black mb-2 italic tracking-tighter">LNM-Verse</h1>
        <p className="text-teal-300 font-medium opacity-80 uppercase tracking-widest text-[10px]">Elevating Campus Life</p>
      </div>

      {/* AGAR SHOW SHOPS FALSE HAI TOH MAIN BUTTONS DIKHAO */}
      {!showShops ? (
        <div className="w-full max-w-sm space-y-4 z-10">
          {/* Student Button */}
          <button
            onClick={handleStudent}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-none flex items-center justify-between group hover:bg-white/20 transition-all shadow-xl"
          >
            <div className="flex items-center gap-4">
               <div className="bg-teal-500 p-3 rounded-none shadow-lg"><FaUserGraduate size={24} /></div>
               <div className="text-left">
                  <p className="font-bold text-lg">Student / Faculty</p>
                  <p className="text-xs text-teal-300">Browse & Order</p>
               </div>
            </div>
            <FaChevronRight className="opacity-50 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Merchant Button (Ispe click karne se List aayegi) */}
          <button
            onClick={() => setShowShops(true)}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-none flex items-center justify-between group hover:bg-white/20 transition-all shadow-xl"
          >
            <div className="flex items-center gap-4">
               <div className="bg-orange-500 p-3 rounded-none shadow-lg"><FaStore size={24} /></div>
               <div className="text-left">
                  <p className="font-bold text-lg">Campus Partner</p>
                  <p className="text-xs text-orange-300">Manage Orders</p>
               </div>
            </div>
            <FaChevronRight className="opacity-50 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        // AGAR SHOW SHOPS TRUE HAI TOH LIST DIKHAO
        <div className="w-full max-w-sm z-10 animate-in fade-in slide-in-from-right-10 duration-300">
          
          {/* Back Button */}
          <button 
            onClick={() => setShowShops(false)} 
            className="flex items-center gap-2 text-teal-200 mb-6 hover:text-white transition-colors"
          >
            <FaArrowLeft /> Back to Selection
          </button>

          <h2 className="text-xl font-bold mb-4 italic">Select Your Outlet</h2>

          <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {SHOPS.map((shop) => (
              <button
                key={shop.id}
                onClick={() => handleShopSelect(shop.id)}
                className="w-full bg-white text-teal-900 p-4 rounded-none flex flex-col items-start hover:bg-teal-50 transition-colors shadow-lg border-l-4 border-teal-500"
              >
                <span className="font-bold text-lg">{shop.name}</span>
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{shop.location}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <p className="absolute bottom-6 text-[10px] opacity-30 font-bold uppercase tracking-widest">Hackathon Build v1.0</p>
    </div>
  );
};

export default Welcome;