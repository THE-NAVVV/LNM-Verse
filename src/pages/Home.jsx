import React, { useState, useEffect } from "react";
import { 
  FaBus, FaTshirt, FaHistory, FaPen, FaCheck, FaArrowRight, FaMapMarkerAlt, 
  FaExternalLinkAlt, FaSearch, FaExclamationCircle, FaCheckCircle,  
  FaPhoneAlt, FaUserSecret, FaUtensils, FaCamera, FaImage, FaTimes, FaCalendarAlt 
} from "react-icons/fa";
import { auth, db } from "../firebase"; 
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp, getDoc, where, limit } from "firebase/firestore";

// --- MAP IMPORTS (Leaflet) ---
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Map
import L from 'leaflet';

// --- LEAFLET ICON FIX (Marker Sahi Dikhane Ke Liye) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Bus Icon
const busIcon = new L.DivIcon({
  className: 'custom-bus-icon',
  html: `<div style="background-color: #FBBF24; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
            <svg fill="black" viewBox="0 0 512 512" style="width:14px;height:14px;"><path d="M48 32C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48H48zm176 288c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm-144 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm288 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"/></svg>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Red Stop Icon
const stopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


// --- CONSTANTS (Schedule, Events, News same as before) ---
const DETAILED_SCHEDULE = {
  weekday: {
    outbound: [{ time: "06:00", dest: "Raja Park" }, { time: "07:00", dest: "Ajmeri Gate" }, { time: "08:00", dest: "Raja Park" }, { time: "10:00", dest: "Raja Park" }, { time: "14:00", dest: "Raja Park" }, { time: "16:30", dest: "Raja Park" }, { time: "17:00", dest: "Ajmeri Gate" }, { time: "18:15", dest: "Raja Park" }, { time: "21:00", dest: "Raja Park" }],
    inbound: [{ time: "07:00", from: "Raja Park" }, { time: "08:00", from: "Ajmeri Gate" }, { time: "11:00", from: "Raja Park" }, { time: "16:00", from: "Raja Park" }, { time: "17:15", from: "Ajmeri Gate" }, { time: "20:30", from: "Raja Park" }]
  },
  weekend: {
    outbound: [{ time: "07:00", dest: "Ajmeri Gate" }, { time: "10:00", dest: "Raja Park" }, { time: "13:00", dest: "Raja Park" }, { time: "16:00", dest: "Raja Park" }, { time: "17:00", dest: "Ajmeri Gate" }, { time: "18:00", dest: "Raja Park" }],
    inbound: [{ time: "08:00", from: "Ajmeri Gate" }, { time: "12:00", from: "Raja Park" }, { time: "15:00", from: "Raja Park" }, { time: "17:15", from: "Raja Park" }, { time: "20:15", from: "Ajmeri Gate" }]
  }
};
const EVENTS = [
  { id: 0, name: "GDG-Inflection", dateObj: new Date("2025-01-05"), dateStr: "Dec 05", type: "Hackathon", hexColor: "#22c55e", isLive: true }, 
  { id: 1, name: "Plinth '26", dateObj: new Date("2026-01-23"), dateStr: "Jan 23", type: "Tech Fest", hexColor: "#06b6d4" }, 
  { id: 2, name: "Desportivos '26", dateObj: new Date("2026-01-30"), dateStr: "Jan 30", type: "Sports Fest", hexColor: "#f97316" }, 
  { id: 4, name: "Vivacity '26", dateObj: new Date("2026-02-06"), dateStr: "Feb 06", type: "Cultural Fest", hexColor: "#ca5c74ff" }, 
];
const NEWS = [
  { id: 1, title: "124 LPA Highest Package", tag: "Placement", color: "border-l-4 border-l-blue-600", details: "LNMIIT achieved a historic milestone in the 2025 placement season with a record-breaking highest package of ₹124 LPA. The season concluded with a strong 93.76% placement rate and an overall average package of ₹13.87 LPA. Top global recruiters, including Google, Microsoft, Amazon, Adobe, and Goldman Sachs, participated in the drive, offering over 440 job opportunities to students across various engineering disciplines." },
  { id: 2, title: "Team Gurumitra Wins", tag: "Hackathon", color: "border-l-4 border-l-amber-500", details: "Team Gurumitra, featuring Himanshu Sharma, Utkarsh Bansal, Arnav Goel, and Amisha Paliwal from LNMIIT, clinched 1st Place at the Google Cloud Agentic AI Day Hackathon 2025. Competing against over 9,100 teams at the BIEC Bengaluru, they won with an AI-driven solution designed to empower teachers in multi-grade classrooms. Their victory was part of a Guinness World Record-setting event for the largest-ever offline AI hackathon." },
  { id: 3, title: "ISRO Challenge Top 16", tag: "Achievement", color: "border-l-4 border-l-green-600", details: "Team Trailblazers, comprising Akshit Agarwal, Chinmay Agravanshi, Saumilya Gupta, and Siddhartha Swarnkar, secured Rank 14 in the ISRO Robotics Challenge – URSC 2025. Competing under the theme 'Fly Me on Mars,' the team successfully developed an autonomous navigation system for Martian aerial vehicles without GPS, placing them among the Top 16 teams nationwide." },
];

const MESS_MENU = {
  0: { // Sunday
    Breakfast: "Chole Bhature / Omelet (L), Sprouts, Fried Masala Mirchi, Bread (PB/Butter/Jam), Tea, Milk, Coffee, Fruit (L)",
    Lunch: "Idly Sambhar with Chutney, Plain Rice, Salad, Achaar, Veg Corn Soup (L)",
    Snacks: "Masala Chana, Coffee, Tea",
    Dinner: "Palak Paneer, Arhar Dal, Jeera Rice, Plain & Butter Roti, Salad, Achaar, Peda (L)"
  },
  1: { // Monday
    Breakfast: "Sambhar Vada with Chutney/Omelet (L), Sprouts, Bread (PB/Butter/Jam), Tea, Milk",
    Lunch: "Rajma, Lauki, Plain & Butter Roti, Missi Roti, Plain Rice, Salad, Achaar, Papad (L), Petha",
    Snacks: "Vada Pav, Chutney, Tea, Coffee",
    Dinner: "Aaloo Matar Tadka, Mix Dal, Jeera Rice, Methi Paratha, Plain & Butter Roti, Salad, Achaar, Gajak (L)"
  },
  2: { // Tuesday
    Breakfast: "Namkeen Poha, Bread (PB/Butter/Jam), Tea, Milk, Cornflakes/Coffee, Fruit (L)",
    Lunch: "Matar Paneer, Dal Fry, Plain & Butter Roti, Missi Roti, Plain Rice, Raw Onion, Achaar, Papad (L)",
    Snacks: "Pasta, Ketchup, Coffee, Tea",
    Dinner: "Dry Aalo Gobhi, Urad-Chana Dal Tadka, Plain & Butter Roti, Matar Pulao, Salad, Achaar, Gajar Halwa (L)"
  },
  3: { // Wednesday
    Breakfast: "Uttapam with Chutney/ Boiled Eggs (L), Sprouts, Bread (PB/Butter/Jam), Tea, Elaichi Milk, Coffee, Fruit (L)",
    Lunch: "Aalo Soyabean, Dal Makhani, Pudina Rice, Plain & Butter Roti, Missi Roti, Salad, Achaar, Suji Halwa (L)",
    Snacks: "Aalo-Pyaz Pakode, Ketchup, Tea, Coffee",
    Dinner: "Manchurian, Chana Dal, Plain & Butter Roti, Fried Rice, Salad, Achaar, Gulab Jamun (L)"
  },
  4: { // Thursday
    Breakfast: "Pav Bhaji / Omelet (L), Sprouts, Bread (PB/Butter/Jam), Tea, Kesar Badam Milk, Cornflakes/Coffee, Fruit (L)",
    Lunch: "Kadhi Pakora, Aloo Bhujia, Plain Rice, Plain & Butter Roti, Missi Roti, Salad, Achaar, Papad (L)",
    Snacks: "Namkeen Poha, Toast (2Pcs), Tea, Coffee",
    Dinner: "Shahi Paneer, Arhar Dal, Jeera Rice, Plain & Butter Roti, Salad, Achaar, Boondi Ladoo (L)"
  },
  5: { // Friday
    Breakfast: "Aloo Paratha with Curd, Garlic Chutney / Boiled Eggs (L), Sprouts, Bread, Tea, Milk, Coffee, Fruit (L)",
    Lunch: "Dry Chole Masale, Dal Tadka, Kashmiri Pulao, Plain & Butter Roti, Missi Roti, Salad, Achaar, Chikki (L), Papad (L)",
    Snacks: "Moong Dal Chila (2Pcs), Green Chutney, Tea, Coffee",
    Dinner: "Mix Veg, Dal Makhni, Plain & Butter Roti, Fried Rice, Salad, Achaar, Moong Dal Halwa (L)"
  },
  6: { // Saturday
    Breakfast: "Dosa & Sambhar-Chutney/ Omelet (L), Sprouts, Bread (PB/Butter/Jam), Tea, Milk, Coffee, Fruit (L)",
    Lunch: "Dal-Bati, Garlic Chutney, Plain & Butter Roti, Fried Mirchi, Jeera Rice, Raw Onion, Achaar",
    Snacks: "Aaloo Tikki (2Pcs), Chutney, Coffee, Tea",
    Dinner: "Palak Paneer, Arhar Dal, Jeera Rice, Plain & Butter Roti, Salad, Achaar, Peda (L)"
  }
};

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDayTab, setSelectedDayTab] = useState(new Date().getDay());
  const [user, setUser] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedMenuDay, setSelectedMenuDay] = useState(new Date().getDay()); // Defaults to today


  // --- REAL ROAD POINTS (Ajmeri Gate -> Raja Park -> Tunnel -> LNMIIT) ---
 // --- FINAL FIXED ROUTE (Correct Locations + Smooth Path) ---
  const roadPoints = [
    // 1. AJMERI GATE (Exact Start)
    [26.9195, 75.8178], // Ajmeri Gate Main Entrance
    [26.9180, 75.8185], // Thoda aage (New Gate)
    
    // 2. Towards Raja Park (Via Albert Hall/Zoo)
    [26.9120, 75.8200], // Ram Niwas Bagh Side
    [26.9100, 75.8215], // Albert Hall Cross
    [26.9050, 75.8240], // MD Road
    
    // 3. RAJA PARK (Main Market Point - STOP 1)
    [26.9000, 75.8275], // Raja Park (Panchwati Circle Area)
    [26.9050, 75.8300], // Govind Marg
    
    // 4. Heading North (Ramgarh Mod)
    [26.9150, 75.8330], // Transport Nagar Side Road
    [26.9250, 75.8360], // Delhi Bypass Road Start
    [26.9350, 75.8380], // Ramgarh Mod
    
    // 5. Jal Mahal & Amer (The North Loop)
    [26.9550, 75.8460], // Jal Mahal (Water Palace)
    [26.9700, 75.8500], // Amer Road
    [26.9850, 75.8550], // Amer Fort Area
    [26.9950, 75.8600], // Kunda Turn

    // 6. DELHI ROAD (NH248) - High Speed Area
    [27.0050, 75.8750], // Kunda Check Post
    [27.0120, 75.8900], // Moving East on NH248
    [27.0150, 75.9050], // Near Nai Ki Thadi
    
    // 7. THE BIG TURN (SH55 Link Road)
    [27.0130, 75.9150], // Turn Point
    [27.0000, 75.9170], // Moving South
    [26.9800, 75.9190], // Straight Road
    [26.9600, 75.9220], // Rural Stretch
    
    // 8. Sumel & LNMIIT
    [26.9450, 75.9230], // Sumel Main
    [26.9380, 75.9225], // Jamdoli Turn
    [26.9363, 75.9235]  // LNMIIT Main Gate (END)
  ];

  const [busIndex, setBusIndex] = useState(0); 
  const [busPosition, setBusPosition] = useState(roadPoints[0]); 
  const [busSpeed, setBusSpeed] = useState(35);

  // Bus Movement Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setBusIndex((prev) => {
        const next = (prev + 1) % roadPoints.length; // Loop wapis start par
        setBusPosition(roadPoints[next]); // Move to next road point
        return next;
      });
      // Random Speed Update
      setBusSpeed(Math.floor(Math.random() * (45 - 25 + 1) + 25));
    }, 1500000); // 1.5 second mein next point par jayegi (Slow movement)

    return () => clearInterval(interval);
  }, []);
  // --- LAUNDRY STATE ---
  const [laundryData, setLaundryData] = useState({ washesLeft: 0, token: "", room: "", hostel: "" });
  const [activeWash, setActiveWash] = useState(null); 
  const [laundryHistory, setLaundryHistory] = useState([]); 
  const [isEditingLaundry, setIsEditingLaundry] = useState(false);
  const [showLaundryHistory, setShowLaundryHistory] = useState(false);

  // --- LOST & FOUND STATE ---
  const [activeLostTab, setActiveLostTab] = useState('lost');
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostForm, setLostForm] = useState({ name: "", location: "", contact: "", photo: null, submittedTo: "guard", submissionLocation: "Main Guard Room" });
  const [lostItems, setLostItems] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const unsubAuth = auth.onAuthStateChanged(async (u) => { 
        if(u) {
            setUser(u);
            
            // 1. User ka Profile
            onSnapshot(doc(db, "users", u.uid), (docSnap) => {
                if(docSnap.exists()) {
                    setLaundryData(prev => ({ ...prev, ...docSnap.data() }));
                }
            });

            // 2. Laundry Orders
            const q = query(collection(db, "laundry_orders"), where("userId", "==", u.uid));
            onSnapshot(q, (snap) => {
                let orders = snap.docs.map(d => ({id: d.id, ...d.data()}));
                orders.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
                const current = orders.find(o => o.status !== 'collected');
                setActiveWash(current || null);
                setLaundryHistory(orders.filter(o => o.status === 'collected'));
            });
        }
    });
    return () => { clearInterval(timer); unsubAuth(); };
  }, []);

  // --- FETCH LOST & FOUND REALTIME ---
  useEffect(() => {
    const q = query(collection(db, "lost_found"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       setLostItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // --- HELPERS ---
  const getScheduleKey = (dayIndex) => (dayIndex === 0 || dayIndex === 6) ? 'weekend' : 'weekday';

  // --- BUS LOGIC (FROM OLD CHECKING.TXT) ---
  const getNextBusData = (direction) => {
    const now = currentTime;
    const todayIndex = now.getDay();
    const todayKey = getScheduleKey(todayIndex);
    const todayRoutes = DETAILED_SCHEDULE[todayKey][direction];
    
    const currentTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // Check today's buses
    for (let route of todayRoutes) {
      const [h, m] = route.time.split(':').map(Number);
      const busTotalSeconds = h * 3600 + m * 60;
      if (busTotalSeconds > currentTotalSeconds) {
        return { ...route, isTomorrow: false, diffSeconds: busTotalSeconds - currentTotalSeconds };
      }
    }

    // If no bus today, get first bus of tomorrow
    const tmrwIndex = (todayIndex + 1) % 7;
    const tmrwKey = getScheduleKey(tmrwIndex);
    const tmrwFirstBus = DETAILED_SCHEDULE[tmrwKey][direction][0];
    
    // Logic: diffSeconds is null means "Tomorrow"
    return { ...tmrwFirstBus, isTomorrow: true, diffSeconds: null };
  };

  const formatCountdownHHMMSS = (totalSeconds) => {
    // Logic: If null (Tomorrow), show "TOMORROW"
    if (totalSeconds === null) return "TOMORROW";
    
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date(); d.setHours(h); d.setMinutes(m);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUrgencyColor = (seconds) => {
    // Logic: If null (Tomorrow), GREEN color
    if (seconds === null) return "bg-green-500"; 
    
    const mins = seconds / 60;
    if (mins < 10) return "bg-red-500 animate-pulse";
    if (mins < 30) return "bg-yellow-400";
    return "bg-green-500";
  };

  const saveLaundryDetails = async () => {
      if(!user) return;
      await updateDoc(doc(db, "users", user.uid), {
          laundryToken: laundryData.token, room: laundryData.room, hostel: laundryData.hostel
      });
      setIsEditingLaundry(false);
  };

  const getStatusStep = (status) => {
      if(!status) return 0;
      if(status === 'accepted') return 2;
      if(status === 'washing') return 3;
      if(status === 'ready') return 4;
      return 1;
  };
  const currentStatusStep = activeWash ? getStatusStep(activeWash.status) : 1;

  // --- LOST & FOUND HANDLERS ---
  const handlePhotoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setLostForm({ ...lostForm, photo: reader.result });
          reader.readAsDataURL(file);
      }
  };

  const handleSubmitLostFound = async () => {
    if(!lostForm.name || !lostForm.location) return alert("Please fill required details");
    await addDoc(collection(db, "lost_found"), {
        type: activeLostTab, ...lostForm, status: 'active',
        timestamp: serverTimestamp(), timeStr: new Date().toLocaleDateString()
    });
    setShowLostModal(false);
    setLostForm({ name: "", location: "", contact: "", photo: null, submittedTo: "guard", submissionLocation: "Main Guard Room" });
  };

  const markResolved = async (id) => {
      if(window.confirm("Mark as Resolved?")) {
        await updateDoc(doc(db, "lost_found", id), { status: 'resolved' });
      }
  };

  // --- COMPONENT: NEXT BUS SPLIT (Checking.txt Logic) ---
  const NextBusSplit = () => {
    const outbound = getNextBusData('outbound');
    const inbound = getNextBusData('inbound');

    return (
      <div className="w-full bg-white border border-gray-200 shadow-sm flex items-stretch h-24 relative z-0">
        <div className="flex-1 flex items-center justify-between px-3 border-r border-gray-200 relative overflow-hidden">
             <div className="flex flex-col items-start z-10 w-full">
                <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-black text-gray-800 uppercase tracking-tight truncate">LNM ➜ {outbound.dest}</span>
                    <div className={`w-2 h-2 rounded-full shrink-0 ml-1 ${getUrgencyColor(outbound.diffSeconds)}`}></div>
                </div>
                <div className="flex items-baseline justify-between w-full">
                     <span className="text-xs font-mono font-bold text-gray-400">{formatCountdownHHMMSS(outbound.diffSeconds)}</span>
                     <span className="text-2xl font-black text-gray-800 tracking-tighter">{formatTime(outbound.time)}</span>
                </div>
             </div>
        </div>
        <div className="flex-1 flex items-center justify-between px-3 relative overflow-hidden">
             <div className="flex flex-col items-end z-10 w-full">
                <div className="flex items-center justify-between w-full mb-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 mr-1 ${getUrgencyColor(inbound.diffSeconds)}`}></div>
                    <span className="text-sm font-black text-gray-800 uppercase tracking-tight truncate">{inbound.from} ➜ LNM</span>
                </div>
                <div className="flex items-baseline justify-between w-full">
                     <span className="text-2xl font-black text-gray-800 tracking-tighter">{formatTime(inbound.time)}</span>
                     <span className="text-xs font-mono font-bold text-gray-400">{formatCountdownHHMMSS(inbound.diffSeconds)}</span>
                </div>
             </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28 font-sans text-gray-900">
      <div className="px-4 mt-6 space-y-8">

        {/* 1. NEXT BUS */}
        <section>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1 h-4 bg-teal-600"></div>
             <h2 className="font-bold text-gray-800 text-base uppercase tracking-wide">Next Bus</h2>
          </div>
          <NextBusSplit />
        </section>

        {/* ...Baaki ka return statement aapka same rahega... */}

        {/* 2. EVENTS */}
        <section>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1 h-4 bg-purple-600"></div>
             <h2 className="font-bold text-gray-800 text-base uppercase tracking-wide">Upcoming Events</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
             {EVENTS.map((ev) => {
                const diff = Math.ceil((ev.dateObj - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={ev.id} className="snap-center min-w-[200px] bg-white border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-32 relative group hover:border-gray-400 transition-colors">
                     <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: ev.hexColor }}></div>
                     <div>
                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{ev.type}</span>
                        <h3 className="font-black text-lg text-gray-800 leading-tight mt-1">{ev.name}</h3>
                     </div>
                     <div className="flex justify-between items-end border-t border-gray-100 pt-2">
                        <span className="text-xs font-bold text-gray-600">{ev.dateStr}</span>
                        {ev.isLive ? <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 uppercase animate-pulse">Live Now</span> : <span className="text-[10px] font-bold uppercase" style={{ color: ev.hexColor }}>{diff} Days to go</span>}
                     </div>
                  </div>
                );
             })}
          </div>
        </section>

        {/* 3. NEWS */}
        <section>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-blue-600"></div>
                <h2 className="font-bold text-gray-800 text-base uppercase tracking-wide">Campus News</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                {NEWS.map((n) => (
                    <div key={n.id} className={`snap-center min-w-[250px] bg-white border border-gray-200 p-4 shadow-sm ${n.color}`}>
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">{n.tag}</span>
                        <h3 className="font-bold text-gray-800 mt-2 text-sm leading-relaxed">{n.title}</h3>
                        <div onClick={() => setSelectedNews(n)} className="mt-3 flex items-center gap-1 text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">
                            Read More <FaArrowRight size={8}/>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* 4. LAUNDRY SECTION (DB CONNECTED) */}
        <section>
          <div className="bg-white border border-gray-200 p-5 shadow-sm relative">
             <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="font-bold text-gray-800 text-base flex items-center gap-2 uppercase tracking-wide">
                    <FaTshirt className="text-gray-400"/> Smart Wash <span className="text-gray-400 text-xs">BH-4</span>
                </h2>
                {/* Yahan Real Washes Left dikhega */}
                <span className="bg-gray-100 text-gray-800 px-3 py-1 text-xs font-black uppercase">{laundryData.washesLeft || 0} Washes Left</span>
             </div>
             
             {/* Status Bar (Real-time update hoga) */}
             <div className="mb-8 px-2">
                <div className="flex justify-between relative items-center">
                   <div className="absolute top-1/2 w-full h-0.5 bg-gray-200 -z-0 -translate-y-1/2"></div>
                   <div className="absolute top-1/2 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-500" style={{width: `${(currentStatusStep-1)*33}%`}}></div>
                   {[1,2,3,4].map(s => (
                      <div key={s} className={`w-4 h-4 flex items-center justify-center text-[8px] border-2 transition-all z-10 bg-white ${currentStatusStep >= s ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}`}>
                         {currentStatusStep >= s && <FaCheck size={8}/>}
                      </div>
                   ))}
                </div>
                <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Order</span><span>Accept</span><span>Wash</span><span>Ready</span>
                </div>
             </div>

             {/* User Details (Token, Room etc.) */}
             <div className="space-y-0 divide-y divide-gray-100 border border-gray-100 bg-gray-50">
                {[
                    { label: "Token No.", value: laundryData.token, key: 'token' },
                    { label: "Room No.", value: laundryData.room, key: 'room' },
                    { label: "Hostel", value: laundryData.hostel, key: 'hostel' }
                ].map((item) => (
                    <div key={item.key} className="flex justify-between items-center p-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                        {isEditingLaundry ? (
                            <input 
                                className="bg-white border border-gray-300 p-1 text-xs font-bold text-right w-20 outline-none focus:border-black" 
                                value={item.value} 
                                onChange={e=>setLaundryData({...laundryData, [item.key]: e.target.value})} 
                            />
                        ) : (
                            <span className="text-sm font-bold text-gray-800">{item.value || "-"}</span>
                        )}
                    </div>
                ))}
             </div>

             <div className="mt-4 flex gap-2">
                 <button onClick={() => isEditingLaundry ? saveLaundryDetails() : setIsEditingLaundry(true)} className="flex-1 py-2 border border-gray-300 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50">
                    {isEditingLaundry ? "Save" : "Edit Details"}
                 </button>
                 <button onClick={() => setShowLaundryHistory(true)} className="flex-1 py-2 bg-gray-900 text-white border border-gray-900 font-bold text-xs uppercase hover:bg-black">
                    History
                 </button>
             </div>
          </div>
        </section>



        
   

       {/* 5. LOST & FOUND */}
        <section>
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-lg font-black text-gray-800 uppercase italic flex items-center gap-2">
                 <FaSearch className="text-gray-400 text-sm"/> Lost & Found
             </h3>
             <button onClick={() => setShowLostModal(true)} className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase rounded-none hover:bg-gray-800">+ Add Item</button>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-none">
             <div className="flex border-b border-gray-100">
                 <button onClick={() => setActiveLostTab('lost')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeLostTab === 'lost' ? 'bg-red-50 text-red-600 border-b-2 border-red-500' : 'text-gray-400'}`}>Lost</button>
                 <button onClick={() => setActiveLostTab('found')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeLostTab === 'found' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-gray-400'}`}>Found</button>
             </div>

             <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                 {lostItems.filter(i => i.type === activeLostTab).map(item => (
                     <div key={item.id} className={`relative p-3 border-l-4 ${item.status === 'resolved' ? 'border-gray-300 bg-gray-50 opacity-60' : item.type === 'lost' ? 'border-red-500 bg-red-50/50' : 'border-green-500 bg-green-50/50'} border border-gray-100 rounded-none`}>
                         
                         {item.status === 'resolved' && (
                             <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                 <span className="border-4 border-gray-600 text-gray-600 px-4 py-1 text-2xl font-black uppercase -rotate-12 bg-white/90">
                                     {item.type === 'lost' ? 'FOUND / RETURNED' : 'SUBMITTED TO GUARD'}
                                 </span>
                             </div>
                         )}

                         <div className="flex gap-3 items-start">
                             {item.photo ? <img src={item.photo} alt="item" className="w-16 h-16 object-cover border border-gray-200" /> : <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400"><FaImage size={20}/></div>}
                             <div className="flex-1">
                                 <h4 className="font-bold text-sm text-gray-800 uppercase leading-none mb-1">{item.name}</h4>
                                 
                                 {/* Location Display */}
                                 <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase"><FaMapMarkerAlt /> {item.location}</div>
                                 
                                 {/* NEW: Contact Number Text Display (Added Here) */}
                                 {item.contact && (
                                     <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                                         <FaPhoneAlt size={8} /> {item.contact}
                                     </div>
                                 )}

                                 <span className="text-[9px] font-bold text-gray-400 uppercase block mt-1">{item.timeStr || "Recently"}</span>
                                 
                                 {item.type === 'found' && (
                                     <div className="mt-2 text-[9px] font-black uppercase bg-white border border-gray-100 p-1 inline-block text-gray-600">
                                         Status: {item.submittedTo === 'guard' ? `At ${item.submissionLocation}` : "With Student"}
                                     </div>
                                 )}
                             </div>
                         </div>
                         
                         {/* Footer Buttons */}
                         <div className="mt-3 flex gap-2 border-t border-gray-200/50 pt-2">
                             {item.status === 'active' && <button onClick={() => markResolved(item.id)} className="flex-1 py-1.5 bg-white border border-gray-200 text-[9px] font-bold uppercase hover:bg-gray-50 text-gray-700">Mark Resolved</button>}
                             
                             {/* UPDATED LOGIC: If Found & At Guard -> Show Badge. Else (Lost OR Found with Student) -> Show Call Button */}
                             {(item.type === 'found' && item.submittedTo === 'guard') ? (
                                 <div className="flex-1 py-1.5 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase flex items-center justify-center gap-1">
                                     <FaUserSecret size={10} /> At Guard
                                 </div>
                             ) : (
                                 <a href={`tel:${item.contact}`} className="flex-1 py-1.5 bg-black text-white text-[9px] font-bold uppercase flex items-center justify-center gap-1 hover:bg-gray-800">
                                     <FaPhoneAlt size={10} /> Call
                                 </a>
                             )}
                         </div>
                     </div>
                 ))}
                 {lostItems.filter(i => i.type === activeLostTab).length === 0 && <p className="text-center text-[10px] font-bold text-gray-400 py-4 uppercase">No items.</p>}
             </div>
          </div>
        </section>


{/* MESS MENU SECTION */}
        <section>
           <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-yellow-500"></div>
              <h2 className="font-bold text-gray-800 text-base uppercase tracking-wide flex items-center gap-2">
                 Mess Menu <FaUtensils className="text-gray-400 text-xs"/>
              </h2>
           </div>
           
           <div className="bg-white border border-gray-200 shadow-sm p-4">
              {/* Day Tabs (Scrollable) */}
              <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar border-b border-gray-100 mb-2">
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                    <button 
                       key={i} 
                       onClick={() => setSelectedMenuDay(i)} 
                       className={`px-4 py-2 text-xs font-bold uppercase transition-all whitespace-nowrap ${selectedMenuDay === i ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                       {d}
                    </button>
                 ))}
              </div>

              {/* Menu Items List */}
              <div className="space-y-3">
                 {(() => {
                    const dayMenu = MESS_MENU[selectedMenuDay];
                    const meals = [
                       { type: "Breakfast", color: "text-orange-600", bg: "bg-orange-50", items: dayMenu.Breakfast },
                       { type: "Lunch", color: "text-yellow-700", bg: "bg-yellow-50", items: dayMenu.Lunch },
                       { type: "Snacks", color: "text-teal-600", bg: "bg-teal-50", items: dayMenu.Snacks },
                       { type: "Dinner", color: "text-indigo-700", bg: "bg-indigo-50", items: dayMenu.Dinner },
                    ];

                    return meals.map((meal, idx) => (
                       <div key={idx} className="flex flex-col p-3 border-l-4 border-gray-100 hover:border-l-gray-400 bg-gray-50 transition-colors">
                          <span className={`text-[9px] font-black uppercase tracking-wider mb-1 ${meal.color}`}>
                             {meal.type}
                          </span>
                          <span className="text-sm font-bold text-gray-800 leading-snug">
                             {meal.items}
                          </span>
                       </div>
                    ));
                 })()}
              </div>
           </div>
        </section>


        {/* 6. BUS SCHEDULE (Same as before) */}
        <section>
           <div className="flex items-center gap-2 mb-2"><div className="w-1 h-4 bg-orange-500"></div><h2 className="font-bold text-gray-800 text-base uppercase tracking-wide">Complete Bus Schedule</h2></div>
           <div className="bg-white border border-gray-200 shadow-sm p-4">
              <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar border-b border-gray-100 mb-2">
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (<button key={i} onClick={() => setSelectedDayTab(i)} className={`px-4 py-2 text-xs font-bold uppercase transition-all ${selectedDayTab === i ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{d}</button>))}
              </div>
              <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                 {(() => {
                    const key = getScheduleKey(selectedDayTab);
                    const schedule = DETAILED_SCHEDULE[key];
                    const list = [...schedule.outbound.map(b => ({route: b.dest, time: b.time, isOut: true, bg: "bg-orange-50", text: "text-orange-800"})), ...schedule.inbound.map(b => ({route: b.from, time: b.time, isOut: false, bg: "bg-teal-50", text: "text-teal-800"}))].sort((a,b) => a.time.localeCompare(b.time));
                    return list.map((item, idx) => (
                       <div key={idx} className={`flex items-center justify-between p-3 border-l-4 border-gray-100 hover:border-l-gray-400 bg-gray-50 transition-colors`}>
                          <div className="flex flex-col"><span className="text-[9px] font-bold uppercase text-gray-400">{item.isOut ? "To" : "From"}</span><span className={`text-xs font-bold uppercase ${item.text}`}>{item.route}</span></div>
                          <span className="text-sm font-mono font-bold text-gray-800">{((t) => {const [h, m] = t.split(':'); const d = new Date(); d.setHours(h); d.setMinutes(m); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });})(item.time)}</span>
                       </div>
                    ));
                 })()}
              </div>
           </div>
        </section>

        {/* 7. BUS STOPS */}
        <section>
          <div className="flex items-center gap-2 mb-2"><div className="w-1 h-4 bg-red-500"></div><h2 className="font-bold text-gray-800 text-base uppercase tracking-wide">Bus Stop Locations</h2></div>
          <div className="grid gap-2">
             {[{ name: "Raja Park", color: "border-l-purple-500", url: "https://maps.app.goo.gl/uowhWSkUSGRyikNH6" }, { name: "Ajmeri Gate", color: "border-l-orange-500", url: "https://maps.app.goo.gl/dvD674dXcUV9rgBQA" }, { name: "Transport Nagar", color: "border-l-blue-500", url: "https://maps.app.goo.gl/pmEYj5r7ZFfjb8vZ6" }].map((stop, i) => (
                 <a key={i} href={stop.url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between w-full bg-white p-4 border border-gray-200 border-l-4 shadow-sm hover:bg-gray-50 ${stop.color}`}>
                    <span className="font-bold text-gray-800 text-sm uppercase">{stop.name}</span><FaExternalLinkAlt className="text-gray-300" size={12}/>
                 </a>
             ))}
          </div>
        </section>

      </div>

     {showLaundryHistory && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-sm p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-black text-gray-800 uppercase">Wash History</h2>
                  <button onClick={() => setShowLaundryHistory(false)} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 text-[10px] font-bold uppercase">Close</button>
               </div>
               <div className="space-y-2">
                  {laundryHistory.length > 0 ? laundryHistory.map((h) => (
                      <div key={h.id} className="flex justify-between p-3 bg-gray-50 border border-gray-100">
                          <div>
                              <p className="font-bold text-gray-700 text-sm">{h.timestamp ? new Date(h.timestamp.seconds*1000).toDateString() : "N/A"}</p>
                              <p className="text-[10px] text-gray-400 uppercase">Token: {h.token}</p>
                          </div>
                          <span className="text-green-700 text-[10px] font-black uppercase bg-green-100 px-2 py-1 h-fit">Collected</span>
                      </div>
                  )) : <p className="text-center text-gray-400 text-xs">No history found.</p>}
               </div>
            </div>
         </div>
      )}

{/* 8. LIVE BUS TRACKING (LEAFLET: REAL ROAD + LABELS) */}
        <section className="relative z-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-green-600 animate-pulse"></div>
            <h2 className="font-bold text-gray-800 text-base uppercase tracking-wide flex items-center gap-2">
              Live Tracking <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            </h2>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden h-[400px] w-full relative z-0">
             
             {/* Map Container */}
            <MapContainer 
    center={[26.960, 75.88]}  // <-- Thoda Upar shift kiya hai center ko
    zoom={11}                 // <-- Zoom level 11 best hai pure route ke liye
    scrollWheelZoom={false}
    className="h-full w-full z-0"
>
             
                {/* OpenStreetMap Tiles (Free) */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 1. BLUE ROUTE LINE (Road ke upar) */}
                <Polyline 
                  positions={roadPoints} 
                  color="#2563eb" // Blue
                  weight={6}
                  opacity={0.7}
                />

                {/* 2. STOPS WITH NAMES (Permanent Tooltips) */}
                
                {/* Ajmeri Gate */}
                <Marker position={roadPoints[0]} icon={stopIcon}>
                  <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent>
                     <span className="font-bold text-xs text-red-700 uppercase">AG</span>
                  </Tooltip>
                </Marker>

                {/* Raja Park (Index 4) */}
                <Marker position={roadPoints[4]} icon={stopIcon}>
                  <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent>
                     <span className="font-bold text-xs text-red-700 uppercase">RP</span>
                  </Tooltip>
                </Marker>

                {/* LNMIIT (Last Point) */}
                <Marker position={roadPoints[roadPoints.length - 1]} icon={stopIcon}>
                  <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent>
                     <span className="font-bold text-xs text-red-700 uppercase">LN</span>
                  </Tooltip>
                </Marker>

                {/* 3. MOVING BUS MARKER */}
                <Marker position={busPosition} icon={busIcon} zIndexOffset={1000}>
                  <Popup closeButton={false} autoClose={false}>
                    <div className="text-center p-0">
                       <strong className="text-[10px] block uppercase">Bus No 2</strong>
                       <span className="text-[9px] text-green-600 font-bold">On Time</span>
                    </div>
                  </Popup>
                </Marker>

             </MapContainer>

             {/* INFO PANEL OVERLAY (Bottom) */}
             <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 grid grid-cols-3 divide-x divide-gray-300 z-[400]">
                <div className="text-center">
                    <p className="text-[9px] text-gray-500 uppercase font-bold">Speed</p>
                    <p className="text-lg font-black text-gray-800">{busSpeed} <span className="text-xs">km/h</span></p>
                </div>
                <div className="text-center">
                    <p className="text-[9px] text-gray-500 uppercase font-bold">Next Stop</p>
                    <p className="text-lg font-black text-gray-800">{busIndex < 5 ? "Raja Park" : "LNMIIT"}</p>
                </div>
                <div className="text-center">
                    <p className="text-[9px] text-gray-500 uppercase font-bold">ETA</p>
                    <p className="text-lg font-black text-green-600 animate-pulse">~15 min</p>
                </div>
             </div>
          </div>
        </section>

      

      {/* LOST MODAL (Same as before) */}
      {showLostModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-sm p-6 shadow-2xl border-t-4 border-teal-500 rounded-none overflow-y-auto max-h-[90vh]">
                  {/* ... Same Content as previously provided ... */}
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-black text-gray-800 uppercase flex items-center gap-2">
                          {activeLostTab === 'lost' ? <FaExclamationCircle className="text-red-500"/> : <FaCheckCircle className="text-green-500"/>} Report {activeLostTab}
                      </h2>
                      <button onClick={() => setShowLostModal(false)} className="text-gray-400 hover:text-black"><FaTimes size={20}/></button>
                  </div>
                  <div className="space-y-4">
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Item Name</label><input type="text" placeholder="e.g. Blue Wallet" className="w-full bg-gray-50 border border-gray-200 p-3 font-bold text-sm outline-none focus:border-black rounded-none" value={lostForm.name} onChange={(e) => setLostForm({...lostForm, name: e.target.value})} /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Location</label><input type="text" placeholder="e.g. Canteen" className="w-full bg-gray-50 border border-gray-200 p-3 font-bold text-sm outline-none focus:border-black rounded-none" value={lostForm.location} onChange={(e) => setLostForm({...lostForm, location: e.target.value})} /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Photo (Optional)</label><div className="flex items-center gap-3"><label className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 cursor-pointer hover:bg-gray-200"><FaCamera className="text-gray-500"/><input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} /></label>{lostForm.photo && <img src={lostForm.photo} alt="Preview" className="w-12 h-12 object-cover border border-gray-200" />}<span className="text-[10px] text-gray-400 font-bold uppercase">Tap to upload</span></div></div>
                      
                      {activeLostTab === 'found' && (
                          <div className="bg-green-50 p-4 border border-green-100 rounded-none">
                              <label className="text-[10px] font-bold text-green-700 uppercase mb-2 block">Where is the item?</label>
                              <div className="flex gap-4 mb-3"><label className="flex items-center gap-2 text-xs font-bold text-gray-700"><input type="radio" name="submittedTo" value="guard" checked={lostForm.submittedTo === 'guard'} onChange={(e) => setLostForm({...lostForm, submittedTo: e.target.value})} className="accent-black"/> Guard</label><label className="flex items-center gap-2 text-xs font-bold text-gray-700"><input type="radio" name="submittedTo" value="self" checked={lostForm.submittedTo === 'self'} onChange={(e) => setLostForm({...lostForm, submittedTo: e.target.value})} className="accent-black"/> I have it</label></div>
                              {lostForm.submittedTo === 'guard' ? <input type="text" placeholder="Which Guard?" className="w-full bg-white border border-green-200 p-2 font-bold text-sm outline-none focus:border-green-600 rounded-none" value={lostForm.submissionLocation} onChange={(e) => setLostForm({...lostForm, submissionLocation: e.target.value})} /> : <input type="number" placeholder="Your Contact" className="w-full bg-white border border-green-200 p-2 font-bold text-sm outline-none focus:border-green-600 rounded-none" value={lostForm.contact} onChange={(e) => setLostForm({...lostForm, contact: e.target.value})} />}
                          </div>
                      )}
                      {activeLostTab === 'lost' && (
                          <div className="bg-red-50 p-4 border border-red-100 rounded-none"><label className="text-[10px] font-bold text-red-700 uppercase mb-1 block">Your Contact</label><input type="number" placeholder="Mobile Number" className="w-full bg-white border border-red-200 p-2 font-bold text-sm outline-none focus:border-red-600 rounded-none" value={lostForm.contact} onChange={(e) => setLostForm({...lostForm, contact: e.target.value})} /></div>
                      )}
                      <button onClick={handleSubmitLostFound} className={`w-full py-4 text-white font-black uppercase tracking-widest hover:opacity-90 rounded-none ${activeLostTab === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>Post {activeLostTab} Item</button>
                  </div>
              </div>
          </div>
      )}

      {/* NEWS MODAL (Same as before) */}
      {selectedNews && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
            <div className={`bg-white w-full max-w-sm p-6 shadow-2xl border-t-4 ${selectedNews.color.replace('border-l-4', 'border-t-4').replace('border-l-', 'border-t-')}`}>
                <div className="flex justify-between items-start mb-4">
                  <div><span className="text-[10px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-1 tracking-wider">{selectedNews.tag}</span><h2 className="text-xl font-black text-gray-900 mt-2 leading-tight">{selectedNews.title}</h2></div>
                  <button onClick={() => setSelectedNews(null)} className="text-gray-400 hover:text-black transition-colors"><FaTimes size={22} /></button>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed font-medium">{selectedNews.details}</div>
                <button onClick={() => setSelectedNews(null)} className="mt-6 w-full bg-gray-900 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">Close</button>
            </div>
          </div>
      )}
    </div>
  );
};

export default Home;