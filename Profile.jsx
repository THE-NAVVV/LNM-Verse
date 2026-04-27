import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth'; 
import { Link } from 'react-router-dom'; 
import { FaSignOutAlt, FaPhoneAlt, FaCalendarAlt, FaSignInAlt, FaUserCircle, FaBuilding, FaPen, FaCheck, FaIdCard, FaUser } from 'react-icons/fa';

const HOSTELS = ["BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "GH", "Faculty Quarters"];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({}); 
  
  // Edit States
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState("");
  
  const [isEditingHostel, setIsEditingHostel] = useState(false);
  const [tempHostel, setTempHostel] = useState("");

  const [isEditingRoll, setIsEditingRoll] = useState(false);
  const [tempRoll, setTempRoll] = useState("");

  // --- 1. FETCH USER & DATA ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            
            // Smart Roll No Logic
            let autoRoll = "";
            if (currentUser.email) {
                const emailPrefix = currentUser.email.split('@')[0].toUpperCase();
                const isStudent = /^(21|22|23|24|25|26|27)/.test(emailPrefix);
                if (isStudent) autoRoll = emailPrefix;
            }

            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data);
                setTempName(data.name || currentUser.displayName || ""); 
                setTempPhone(data.phone || currentUser.phoneNumber || "");
                setTempHostel(data.hostel || "");
                setTempRoll(data.rollNo ? data.rollNo : autoRoll);
            } else {
                setTempName(currentUser.displayName || "");
                setTempPhone(currentUser.phoneNumber || "");
                setTempRoll(autoRoll);
                
                // Init User Doc
                setDoc(docRef, { 
                    name: currentUser.displayName,
                    rollNo: autoRoll 
                }, { merge: true });
            }
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. SAVE HANDLERS ---
  const saveField = async (field, value, setIsEditing) => {
      try {
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { [field]: value }, { merge: true });
          setUserData(prev => ({ ...prev, [field]: value })); 
          setIsEditing(false);
      } catch (error) {
          alert("Error saving: " + error.message);
      }
  };

  const saveName = async () => {
      try {
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { name: tempName }, { merge: true });
          await updateProfile(user, { displayName: tempName });
          setUserData(prev => ({ ...prev, name: tempName }));
          setIsEditingName(false);
      } catch (error) {
          alert("Error updating name: " + error.message);
      }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
        auth.signOut();
        window.location.href = "/"; 
    }
  };

if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative flex flex-col items-center justify-center">
            {/* Logo Animation */}
            <div className="relative flex items-center justify-center mb-4">
                {/* Ping animation ka color thoda light grey/teal kiya hai taaki white background pe dikhe */}
                <div className="absolute w-24 h-24 bg-teal-100 opacity-50 animate-ping"></div>
                
                <h1 className="relative z-10 text-4xl font-black italic tracking-tighter animate-bounce">
                    {/* LNM: Black */}
                    <span className="text-black">LNM</span>
                    {/* Verse: Green (Emerald-500 white background pe zyada saaf dikhta hai) */}
                    <span className="text-emerald-500">Verse</span>
                </h1>
            </div>

            {/* Niche wala text (Grey) */}
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                Elevating Campus Life
            </p>
        </div>
    </div>
);

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <FaUserCircle size={60} className="text-gray-300 mb-4" />
        <p className="text-lg text-gray-600 font-medium mb-6">You are not logged in</p>
        <Link to="/login" className="bg-teal-700 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-800 transition-all flex items-center gap-2">
            <FaSignInAlt /> Login Now
        </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* HEADER */}
      <div className="bg-teal-700 pt-10 pb-32 px-6 rounded-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-600 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
          
          <div className="relative z-10 flex flex-col items-start w-full">
             <div className="bg-white/10 p-2 rounded-none mb-3 backdrop-blur-sm border border-white/20">
                <FaUser className="text-white text-2xl" />
             </div>
             
             <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-1">Hello!</p>
             
             {/* NAME SECTION FIXED: added pb-1 and changed leading-none to leading-tight */}
             <div className="flex items-center gap-3 w-full">
                 {isEditingName ? (
                     <input 
                        autoFocus
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-transparent border-b-2 border-white text-3xl font-black text-white outline-none w-full placeholder-white/50 pb-1 leading-tight"
                     />
                 ) : (
                     <h1 className="text-3xl font-black text-white tracking-tight leading-tight text-left truncate pb-1">
                        {userData.name || user.displayName}
                     </h1>
                 )}

                 <button 
                    onClick={() => isEditingName ? saveName() : setIsEditingName(true)} 
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-md transition-all shrink-0"
                 >
                    {isEditingName ? <FaCheck size={14} /> : <FaPen size={12} />}
                 </button>
             </div>
          </div>
      </div>

      {/* INFO CARDS */}
      <div className="px-5 -mt-12 space-y-4 relative z-20">
          
          <div className="bg-white rounded-none shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Phone Section */}
              <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-none text-green-600 shrink-0">
                    <FaPhoneAlt size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                      {isEditingPhone ? (
                          <input 
                            autoFocus
                            type="tel" 
                            value={tempPhone} 
                            onChange={(e) => setTempPhone(e.target.value)}
                            className="w-full font-bold text-gray-800 text-lg bg-gray-50 border-b-2 border-green-500 outline-none py-1"
                          />
                      ) : (
                          <p className="text-lg font-bold text-gray-800 break-words">
                              {userData.phone || "Add Number"}
                          </p>
                      )}
                  </div>
                  <button onClick={() => isEditingPhone ? saveField('phone', tempPhone, setIsEditingPhone) : setIsEditingPhone(true)} className="p-2 text-gray-400 hover:text-teal-600 shrink-0">
                      {isEditingPhone ? <FaCheck className="text-green-600 text-lg"/> : <FaPen size={12}/>}
                  </button>
              </div>

              {/* Roll No Section */}
              <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-none text-blue-600 shrink-0">
                    <FaIdCard size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Roll Number</p>
                      {isEditingRoll ? (
                          <input 
                            autoFocus
                            type="text" 
                            value={tempRoll} 
                            onChange={(e) => setTempRoll(e.target.value)}
                            className="w-full font-black text-gray-800 text-lg uppercase bg-gray-50 border-b-2 border-blue-500 outline-none py-1"
                          />
                      ) : (
                          <p className="text-lg font-black text-gray-800 uppercase break-words">
                              {userData.rollNo || tempRoll || "Add Roll No"}
                          </p>
                      )}
                  </div>
                  <button onClick={() => isEditingRoll ? saveField('rollNo', tempRoll, setIsEditingRoll) : setIsEditingRoll(true)} className="p-2 text-gray-400 hover:text-teal-600 shrink-0">
                      {isEditingRoll ? <FaCheck className="text-green-600 text-lg"/> : <FaPen size={12}/>}
                  </button>
              </div>

              {/* Hostel Section */}
              <div className="p-4 flex items-center gap-3">
                  <div className="bg-orange-50 p-2 rounded-none text-orange-600 shrink-0">
                    <FaBuilding size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">My Hostel</p>
                      {isEditingHostel ? (
                          <select 
                            value={tempHostel} 
                            onChange={(e) => setTempHostel(e.target.value)}
                            className="w-full font-bold text-gray-800 text-sm bg-gray-50 border border-gray-200 rounded p-2 outline-none"
                          >
                              <option value="">Select Hostel...</option>
                              {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                      ) : (
                          <p className="text-lg font-bold text-gray-800 truncate">
                              {userData.hostel || "Select Hostel"}
                          </p>
                      )}
                  </div>
                  <button onClick={() => isEditingHostel ? saveField('hostel', tempHostel, setIsEditingHostel) : setIsEditingHostel(true)} className="p-2 text-gray-400 hover:text-teal-600 shrink-0">
                      {isEditingHostel ? <FaCheck className="text-green-600 text-lg"/> : <FaPen size={12}/>}
                  </button>
              </div>
          </div>

          <div className="bg-white rounded-none shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className="bg-purple-50 p-2 rounded-none text-purple-600">
                  <FaCalendarAlt size={16} />
              </div>
              <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Member Since</p>
                  <p className="text-sm font-bold text-gray-700">
                    {user.metadata.creationTime ? new Date(user.metadata.creationTime).toDateString() : "N/A"}
                  </p>
              </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-white text-red-500 border-2 border-red-50 font-black py-4 rounded-none flex items-center justify-center gap-2 hover:bg-red-50 transition-all shadow-sm mt-4"
          >
            <FaSignOutAlt /> LOGOUT
          </button>

          <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest pt-4">LNM-Verse v1.0 • Hackathon Edition GDG LNMIIT</p>
      </div>
    </div>
  );
};

export default Profile;