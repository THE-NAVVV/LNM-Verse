import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { FaHome, FaCar, FaUser, FaClipboardList } from 'react-icons/fa'; 
import { auth } from './firebase'; 

// Pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';         
import Canteen from './pages/Canteen'; 
import Home from './pages/Home';
import Rides from './pages/Rides';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders'; 
import Admin from './pages/Admin'; 

const MainContent = () => {
  const [user, setUser] = useState(null);
  const location = useLocation(); 
  
  // Logic to detect paths
  const isAuthPath = ['/welcome', '/login'].includes(location.pathname);
  const isAdminPath = location.pathname.startsWith('/admin');
  const isCanteenPage = location.pathname === '/canteen';

  // 🚨 Student Nav sirf tab dikhega jab user Admin ya Welcome/Login par NA HO
  const showStudentNav = !isAuthPath && !isAdminPath;

  // --- NEW: Time State for Header ---
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setUser(user));
    
    // Timer for Date/Time Header
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const getLinkClass = (path) => {
    return location.pathname === path 
      ? "flex flex-col items-center text-teal-600 font-bold" 
      : "flex flex-col items-center text-gray-400 hover:text-teal-500 font-medium transition-colors";
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-16">
      
      {/* GLOBAL HEADER: Replaced with New Design (Date/Time) */}
      {/* Shows on Home, Rides, Profile, etc. (Not on Auth, Admin, or Canteen) */}
      {!isAuthPath && !isAdminPath  && (
         <div className="bg-white px-5 pt-8 pb-4 border-b border-gray-200 sticky top-0 z-40 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tighter leading-none">
                LNM<span className="text-teal-600">Verse</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Elevating Campus Life</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800 leading-none">{currentTime.toLocaleDateString('en-US', {day:'numeric', month:'short'})}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{currentTime.toLocaleDateString('en-US', {weekday:'long'})}</p>
            </div>
         </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/welcome" />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/canteen" element={<Canteen />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/admin/:shopId" element={<Admin />} />
      </Routes>

      {/* BOTTOM NAV: Only for Student Pages */}
      {showStudentNav && (
        <div className="fixed bottom-0 w-full h-16 bg-white border-t flex justify-around items-center z-50 shadow-lg">
           <Link to="/home" className={getLinkClass("/home")}><FaHome size={20} /><span>Home</span></Link>
           <Link to="/canteen" className={getLinkClass("/canteen")}><FaClipboardList size={20} /><span>Canteen</span></Link>
           <Link to="/rides" className={getLinkClass("/rides")}><FaCar size={20} /><span>Rides</span></Link>
           <Link to="/profile" className={getLinkClass("/profile")}><FaUser size={20} /><span>Profile</span></Link>
        </div>
      )}

    </div>
  );
};

const App = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};

export default App;