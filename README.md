<div align="center">
  
  # 🚀 LNM-Verse: Campus Utility App
  
  ### 🎥 Watch the Full Project Demo
  
  <a href="https://drive.google.com/file/d/1FjIe7mEkWsF5RV4t01eEHka48N4T5KBV/view?usp=sharing">
    <img src="https://img.shields.io/badge/▶_PLAY_DEMO_VIDEO-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch Demo" height="50"/>
  </a>

  <p><em>Click the button above to see Real-time Bus Tracking, AI Canteen & Rides Logic!</em></p>

</div>

---
# 🚀 LNM-Verse: The Campus Super App

**Tagline:** Elevating Campus Life.

**LNM-Verse** is a comprehensive campus utility platform designed to solve daily student hassles—from food ordering and laundry management to ride-sharing. It leverages the power of Google's ecosystem to create a seamless, real-time experience.

🔗 **Live Demo:** [https://lnm-verse.web.app/welcome](https://lnm-verse.web.app/welcome)  *(Recommended for the best testing experience)*                             
   # 🎥 Project Demo
   **Note:** Watch the full working prototype of LNM-Verse showing Real-time Sync and AI Features.

[![Watch Video](https://img.shields.io/badge/▶_Watch_Demo_Video-Click_Here-red?style=for-the-badge&logo=google-drive)](https://drive.google.com/file/d/1FjIe7mEkWsF5RV4t01eEHka48N4T5KBV/view?usp=sharing)


---

## 🌟 Key Features & Tech Stack

This project is built using a modern **Serverless Architecture** ensuring speed and scalability.

### 🛠️ Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS (Mobile-First Design).
- **Backend:** **Google Firebase** (Auth, Firestore Database, Hosting).
- **AI Engine:** **Google Gemini 2.5 Flash** (For intelligent food recommendations).
- **Location Services:** **Google Maps Integration**.
- **Real-Time Sync:** Uses **Firestore Snapshots** (No page refresh required for updates).
---

## 🧪 Comprehensive Testing Guide (Walkthrough)

To fully experience the app, follow this step-by-step guide. You will need to switch between "Student" and "Merchant" roles to see the real-time interaction.

### 1. 🚌 Smart Commute (Bus Schedule)
*Navigate to the Home Screen.*
- **Next Bus Logic:** The app calculates the time remaining for the next bus automatically.
    - 🟢 **Green Dot:** Time > 30 mins.
    - 🟡 **Yellow Dot:** Time < 30 mins.
    - 🔴 **Red Blinking:** Time < 10 mins (Rush!).
- **Locations:** Click on stops like "Raja Park" or "Ajmeri Gate" to open the exact location in **Google Maps**.
- **Full Schedule:** You can view the complete timetable, which defaults to the current day.

### 2. 🧺 Laundry Management (Hybrid System)
*This requires testing two roles simultaneously. Open the app in two different tabs/browsers.*

**Role A: Student (Tab 1)**
1. Go to the **Laundry** section on the Home page.
2. Enter a Token Number (e.g., `130`, `145`, `175`, `345`).
3. You will see your wash status here.

**Role B: Laundry Merchant (Tab 2)**
1. Go to **Profile** -> **Merchant Login**.
2. Select Store: **Quick Smart Wash (BH4 Laundry)**.
3. Login (You can use any Google account; it creates a dummy owner session).
4. **Action:**
    - A student comes with a laundry bag (Token `130`).
    - Enter `130` in the search box.
    - The system pulls up the Student Name, Hostel, and Room No.
    - First time? Set the "Remaining Washes" plan (e.g., 28 washes).
    - Click **"Wash -1"**.
5. **Real-Time Status Flow:**
    - Click **Accepted** -> **Wash Start** -> **Ready** -> **Collected**.
    - *Observe Tab 1 (Student):* The status updates instantly without refreshing!

### 3. 🍔 Smart Canteen & AI Orders
*Navigate to Canteen Page.*

**AI Recommendation:**
- Click "Ask AI". Enter your mood or budget (e.g., "I have 100rs and want something spicy").
- **Google Gemini 2.5 Flash** will suggest the best combo available on campus.

**Ordering Process (Kraverse / Amul / Nescafe):**
1. Select a shop (e.g., **Kraverse Kitchen**).
2. **Menu:** Toggle buttons are available for Half/Full plate portions. Prices update dynamically.
3. Add items to **Cart** -> Proceed to Checkout.
4. Select **"Order for Me"** -> Choose **Delivery / Dine-in / Takeaway**.
5. If Delivery: Select Hostel. The system calculates GST automatically.
6. Place Order. You are redirected to **My Orders**.

**Merchant View (Testing):**
1. Logout of Laundry or open a new tab.
2. **Merchant Login** -> Select **Kraverse Kitchen**.
3. You will see the live order dashboard (Total Sales, Pending, Completed).
4. Change status: **Preparing -> Ready -> Delivered**.
5. Check the Student tab to see the order history update instantly.

### 4. 💇 Salon Booking
1. Go to **Canteen/Shops** tab -> Scroll to **Salon**.
2. Select Service (Men/Women) -> Choose a Time Slot -> Book.
3. **Merchant Login** -> Select **Salon**. You can manage incoming appointments here.

### 5. 🚕 Rides (Carpooling & Auto)
*Navigate to Rides Page.*
- **Share a Cab:** Post a ride request (Destination, Date, Time, Seats). Other students can see this, call, or WhatsApp you to split the fare. You can delete the ride if plans change.
- **Book Auto:** Click "Book Auto".
- **Auto Driver Login:** Go to Merchant Login -> **Auto Book LNMIIT**. Drivers can accept rides and manage bookings.

---

## 📂 Project Structure & Local Installation

If you prefer to run the project locally, ensure your file tree matches the structure below.

### 1. File Structure
Ensure your VS Code file tree looks like this for the imports to work correctly:

```text
LNM-Verse/
├── public/              # Manifest, Icons
├── src/
│   ├── assets/          # Images/SVGs
│   ├── components/      # Reusable UI components
│   │   ├── Cart_old.jsx
│   │   ├── Menu.jsx
│   │   ├── ShopCard.jsx
│   │   └── ...
│   ├── data/            # Static data (menuData.js)
│   ├── hooks/           # Custom hooks (useCountdown.js)
│   ├── pages/           # Main Route Pages
│   │   ├── Admin.jsx
│   │   ├── Canteen.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── MyOrders.jsx
│   │   ├── Profile.jsx
│   │   ├── Rides.jsx
│   │   └── Welcome.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── firebase.js      # Firebase Configuration
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
2. Installation Commands
Prerequisites: Node.js installed.

   Clone the Repository:

   Bash

git clone
cd LNM-Verse
Install Dependencies:

Bash

npm install
Run Locally:

Bash

npm run dev
Open the local server link (usually http://localhost:5173) in your browser.

Note: For the best experience with authentication and database triggers, we recommend using the Live Demo link provided at the top, as it is fully hosted on Firebase.

Built with ❤️ for the Hackathon.
