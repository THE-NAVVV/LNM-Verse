import React, { useState } from 'react';
import { db } from '../firebase'; 
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore'; 

// --- 1. KRAVERS KITCHEN (The Big List) ---
const kraversMenu = [
  [
  {
    "shopId": "shop_kravers",
    "category": "Salad and Accompaniments",
    "name": "Green Salad",
    "price": 70,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Salad and Accompaniments",
    "name": "Roasted Papad",
    "price": 20,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Salad and Accompaniments",
    "name": "Masala Papad",
    "price": 30,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Soups",
    "name": "Clear Soup",
    "price": 70,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 70, "full": 130 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Soups",
    "name": "Cream of Tomato",
    "price": 80,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 80, "full": 150 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Soups",
    "name": "Hot N Sour",
    "price": 90,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 90, "full": 170 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Soups",
    "name": "Veg Manchow",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 190 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Breakfast",
    "name": "Poha",
    "price": 50,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breakfast",
    "name": "Aloo Parantha",
    "price": 60,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breakfast",
    "name": "Aloo Pyaaz Parantha",
    "price": 60,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breakfast",
    "name": "Paneer Parantha",
    "price": 70,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breakfast",
    "name": "Chole Bhature",
    "price": 100,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Street Food",
    "name": "Vada Pav",
    "price": 60,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Street Food",
    "name": "Pav Bhaji",
    "price": 100,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Rolls",
    "name": "Veg Roll",
    "price": 80,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Rolls",
    "name": "Chinese Roll",
    "price": 100,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Rolls",
    "name": "Paneer Roll",
    "price": 100,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Pastas and Fries",
    "name": "Red Pasta",
    "price": 90,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 90, "full": 180 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Pastas and Fries",
    "name": "White Pasta",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Pastas and Fries",
    "name": "Peri Peri Fries",
    "price": 80,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 80, "full": 150 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Pastas and Fries",
    "name": "Cheesy Fries",
    "price": 120,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 120, "full": 220 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Burgers and Sandwiches",
    "name": "Veg Burger",
    "price": 50,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Burgers and Sandwiches",
    "name": "Veg Burger with Cheese",
    "price": 70,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Burgers and Sandwiches",
    "name": "Butter Toast",
    "price": 40,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Burgers and Sandwiches",
    "name": "Grilled Sandwich",
    "price": 100,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Burgers and Sandwiches",
    "name": "Grilled Sandwich with Cheese",
    "price": 120,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Burgers and Sandwiches",
    "name": "Mumbai Grilled Sandwich",
    "price": 110,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Paneer Butter Masala",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Paneer Lababdar",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Shahi Paneer",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Kadai Paneer",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Paneer Bhurji",
    "price": 95,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 95, "full": 190 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Malai Kofta",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Soya Chaap Masala",
    "price": 90,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 90, "full": 180 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Dal Makhani",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 180 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Dal Tadka",
    "price": 80,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 80, "full": 160 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Dal Fry",
    "price": 80,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 80, "full": 150 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Sev Tamatar",
    "price": 80,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 80, "full": 160 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Chana Masala",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Mix Veg Sabji",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 180 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Indian Main Course",
    "name": "Sarson ka Saag (Seasonal)",
    "price": 130,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 130, "full": 220 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Rice",
    "name": "Steam Rice",
    "price": 80,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 80, "full": 150 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Rice",
    "name": "Jeera Rice",
    "price": 90,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 90, "full": 170 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Rice",
    "name": "Veg Biryani with Raita",
    "price": 140,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 140, "full": 260 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Tandoori Roti",
    "price": 15,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Tandoori Roti Butter",
    "price": 18,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Laccha Parantha",
    "price": 40,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Naan",
    "price": 40,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Butter Naan",
    "price": 45,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Garlic Naan",
    "price": 50,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Stuffed Naan",
    "price": 75,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Missi Roti",
    "price": 45,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Breads",
    "name": "Makke ke Roti",
    "price": 45,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Sizzlers",
    "name": "Chinese Sizzler",
    "price": 260,
    "description": "Veg Fried Rice, Noodles, Chilli Paneer & Manchurian Balls in Chinese Sauce",
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Sizzlers",
    "name": "Special Sizzler",
    "price": 300,
    "description": "Butter Rice, Baked Veg, Aloo Patty, Paneer, Mushroom, Fruit Cocktail with Tomato Cheese Sauce",
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Starters",
    "name": "Mix Veg Pakode",
    "price": 80,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Starters",
    "name": "Paneer Pakode",
    "price": 120,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Starters",
    "name": "Hara Bhara Kebab",
    "price": 80,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 80, "full": 150 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Starters",
    "name": "Paneer Tikka",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Starters",
    "name": "Afghani Paneer Tikka",
    "price": 100,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 100, "full": 200 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Starters",
    "name": "Tandoori Soya Chaap",
    "price": 80,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 80, "full": 160 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Starters",
    "name": "Afghani Soya Chaap",
    "price": 90,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 90, "full": 180 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Spring Roll",
    "price": 110,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Veg Chowmein",
    "price": 120,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 120, "full": 220 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Hakka Noodles",
    "price": 140,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 140, "full": 260 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Schezwan Noodles",
    "price": 140,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 140, "full": 260 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Veg Fried Rice",
    "price": 120,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 120, "full": 220 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Schezwan Fried Rice",
    "price": 140,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 140, "full": 260 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Chinese Bhel",
    "price": 140,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 140, "full": 260 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Crispy Corn",
    "price": 140,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 140, "full": 260 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Chilli Potato",
    "price": 140,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 140, "full": 260 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Honey Chilli Potato",
    "price": 150,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 150, "full": 280 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Veg Manchurian (Dry/Gravy)",
    "price": 75,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 75, "full": 150 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Chinese",
    "name": "Chilli Paneer (Dry/Gravy)",
    "price": 90,
    "isAvailable": true,
    "hasVariants": true,
    "variants": { "half": 90, "full": 160 }
  },
  {
    "shopId": "shop_kravers",
    "category": "Curd Varieties",
    "name": "Buttermilk",
    "price": 30,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Curd Varieties",
    "name": "Lassi",
    "price": 40,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Curd Varieties",
    "name": "Plain Curd",
    "price": 20,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Curd Varieties",
    "name": "Boondi Raita",
    "price": 50,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Curd Varieties",
    "name": "Vegetable Raita",
    "price": 70,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Extras",
    "name": "Extra Pav",
    "price": 25,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Extras",
    "name": "Extra Bhatura",
    "price": 35,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Extras",
    "name": "Extra Sabji",
    "price": 50,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Add-ons",
    "name": "Ice Cream",
    "price": 30,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Add-ons",
    "name": "Cheese",
    "price": 20,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Hot Tea",
    "price": 20,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Lemon Ice Tea",
    "price": 60,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Hot Coffee",
    "price": 30,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Cold Coffee",
    "price": 70,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Cold Coffee with Ice Cream",
    "price": 100,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Chocolate Shake",
    "price": 70,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Oreo Shake",
    "price": 80,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Kitkat Shake",
    "price": 90,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Classic Lemonade",
    "price": 60,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Beverages",
    "name": "Virgin Mojito",
    "price": 70,
    "isAvailable": true
  },
  {
    "shopId": "shop_kravers",
    "category": "Desserts",
    "name": "Ice Cream Scoop (Vanilla / Chocolate)",
    "price": 50,
    "isAvailable": true
  }
]
];

// --- 2. OTHER SHOPS ---
const otherShops = [
  // VINAYAK
  { shopId: "shop_vinayak", shopName: "Vinayak Mishthan", category: "Snacks", name: "Samosa", price: 20 },
  { shopId: "shop_vinayak", shopName: "Vinayak Mishthan", category: "Sweets", name: "Jalebi (100g)", price: 40 },
  { shopId: "shop_vinayak", shopName: "Vinayak Mishthan", category: "Meals", name: "Chole Bhature", price: 120 },
  
  // JUICE
  { shopId: "shop_juice", shopName: "Juice Center", category: "Fresh Juice", name: "Orange Juice", price: 60 },
  { shopId: "shop_juice", shopName: "Juice Center", category: "Shakes", name: "Mango Shake", price: 90 },

  // AMUL
  { shopId: "shop_amul", shopName: "Amul Parlour", category: "Ice Cream", name: "Cornetto", price: 40 },
  { shopId: "shop_amul", shopName: "Amul Parlour", category: "Dairy", name: "Amul Lassi", price: 20 },

  // SALON
  { shopId: "shop_salon", shopName: "Campus Salon", category: "Hair", name: "Haircut (Men)", price: 100 },

  // CCD
  { shopId: "shop_ccd", shopName: "Cafe Coffee Delight", category: "Coffee", name: "Cappuccino", price: 120 },
  { shopId: "shop_ccd", shopName: "Cafe Coffee Delight", category: "Pizza", name: "Corn Pizza", price: 220 },
  { shopId: "shop_ccd", shopName: "Cafe Coffee Delight", category: "Burger", name: "Veg Burger", price: 90 },

  // NESCAFE BH4
  { shopId: "shop_nescafe_bh4", shopName: "Nescafe (BH4)", category: "Snacks", name: "Maggi", price: 40 },
  { shopId: "shop_nescafe_bh4", shopName: "Nescafe (BH4)", category: "Hot Coffee", name: "Classic Coffee", price: 20 },

  // NESCAFE CANTEEN
  { shopId: "shop_nescafe_canteen", shopName: "Nescafe (Canteen)", category: "Snacks", name: "Maggi", price: 40 },
  { shopId: "shop_nescafe_canteen", shopName: "Nescafe (Canteen)", category: "Cold Coffee", name: "Nescafe Frappe", price: 60 },
];

export default function MenuUploader() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");

  const resetAndUpload = async () => {
    if(!confirm("⚠️ This will WIPE the database and upload 100+ items. Continue?")) return;
    
    setLoading(true);
    setStatus("Deleting old data...");
    
    try {
      // 1. DELETE OLD DATA
      const querySnapshot = await getDocs(collection(db, "menu"));
      const deleteBatch = writeBatch(db);
      querySnapshot.forEach((doc) => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
      
      // 2. UPLOAD KRAVERS (Batch 1)
      setStatus("Uploading Kravers Kitchen...");
      const batch1 = writeBatch(db);
      kraversMenu.forEach(item => {
        const docRef = doc(collection(db, "menu"));
        batch1.set(docRef, { ...item, shopId: "shop_kravers", shopName: "Kravers Kitchen", isVeg: true, available: true });
      });
      await batch1.commit();

      // 3. UPLOAD OTHERS (Batch 2)
      setStatus("Uploading Other Shops...");
      const batch2 = writeBatch(db);
      otherShops.forEach(item => {
        const docRef = doc(collection(db, "menu"));
        batch2.set(docRef, { ...item, isVeg: true, available: true });
      });
      await batch2.commit();

      setStatus("✅ Success!");
      alert("✅ DATABASE FIXED! Full Kravers Menu + All Shops are uploaded.");
      
    } catch (error) {
      console.error(error);
      setStatus("❌ Error: " + error.message);
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md m-4 text-center border-2 border-indigo-100">
      <h2 className="text-2xl font-bold mb-2 text-indigo-900">Final Database Fixer</h2>
      <p className="mb-6 text-gray-500">Uploads Kravers (Separate Batch) + All Others</p>
      
      <div className="mb-4 font-mono text-sm text-blue-600 bg-blue-50 p-2 rounded">
        Status: {status}
      </div>

      <button onClick={resetAndUpload} disabled={loading}
        className={`px-8 py-4 rounded-full font-bold shadow-lg text-white ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
        {loading ? "Working..." : "🔄 Reset & Upload Everything"}
      </button>
    </div>
  );
}