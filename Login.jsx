import React, { useEffect, useState } from 'react';
import { auth, provider } from '../firebase'; 
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaShieldAlt, FaUserGraduate } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');

  useEffect(() => {
    // Check user (Student ya Merchant)
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) setRole(storedRole);
  }, []);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const shopId = localStorage.getItem('merchantShopId');

      if (role === 'merchant' && shopId) {
        navigate(`/admin/${shopId}`); 
      } else {
        navigate('/home');  
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login Failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-teal-800 p-6">
      <div className="bg-white p-8 rounded-none shadow-2xl w-full max-w-sm text-center border-4 border-teal-900/10">
        
        {/* Dynamic Icon based on Role */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${role === 'merchant' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
            {role === 'merchant' ? <FaShieldAlt className="text-3xl"/> : <FaUserGraduate className="text-3xl"/>}
        </div>

        {/* Dynamic Title */}
        <h1 className="text-2xl font-black mb-2 italic text-gray-800">
            {role === 'merchant' ? 'Partner Login' : 'Student Login'}
        </h1>
        <p className="text-gray-400 text-sm mb-8 font-medium">
            {role === 'merchant' ? 'Manage your shop orders' : 'Login to order food & rides'}
        </p>

        <button 
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 rounded-none font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20"
        >
          <FaGoogle className="text-red-500 text-xl" />
          <span>Continue with Google</span>
        </button>

        <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Authorized Access Only
        </p>
      </div>
    </div>
  );
};


export default Login;
