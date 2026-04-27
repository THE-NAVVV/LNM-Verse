import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore'; // Data save karne ke liye

const ProfileSetup = ({ user, onSetupComplete }) => {
  const [phone, setPhone] = useState("");
  const [hostel, setHostel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (phone.length < 10 || !hostel.trim()) {
      alert("Please fill all details correctly.");
      return;
    }
    setLoading(true);

    try {
      // 1. Firestore user data save (Backup ke liye)
      await setDoc(doc(db, "users", user.email), {
        name: user.displayName,
        email: user.email,
        phone: phone,
        hostel: hostel,
        photo: user.photoURL,
        joinedAt: new Date()
      });

      // 2. LocalStorage mein save karo (Fast access  - Cart.jsx use it)
      localStorage.setItem('userPhone', phone);
      localStorage.setItem('userHostel', hostel);

      setLoading(false);
      onSetupComplete(); // App.js ko bolo: "setup is done go ahead"
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Error saving details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-6 rounded-none shadow-xl">
        <h2 className="text-2xl font-bold text-teal-700 mb-2">Welcome, {user.displayName.split(" ")[0]}! 👋</h2>
        <p className="text-gray-500 mb-6">Complete your profile to continue.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
            <input 
              type="number" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-none focus:border-teal-500 outline-none"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Hostel / Room No</label>
            <input 
              type="text" 
              value={hostel} 
              onChange={(e) => setHostel(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-none focus:border-teal-500 outline-none"
              placeholder="BH-1, Room 102"
            />
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-none font-bold mt-4 shadow-lg hover:bg-teal-700"
          >
            {loading ? "Saving..." : "Continue to App →"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default ProfileSetup;
