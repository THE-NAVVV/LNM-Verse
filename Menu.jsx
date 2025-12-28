import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // CHECK THIS PATH
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import Cart from "./Cart_old"; 

// --- Sub-Component for Individual Menu Items ---
const MenuItemCard = ({ item, onAddToCart }) => {
  // If item has variants, default to "half", else null
  const [selectedVariant, setSelectedVariant] = useState(item.hasVariants ? "half" : null);

  // Calculate current price based on selection
  const currentPrice = item.hasVariants ? item.variants[selectedVariant] : item.price;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
        <p className="text-gray-500 text-xs mb-2">{item.category}</p>
        
        {/* Toggle Switch for Half/Full */}
        {item.hasVariants && (
          <div className="flex bg-gray-100 rounded-lg p-1 w-max mb-3">
            <button 
              onClick={() => setSelectedVariant("half")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${selectedVariant === "half" ? "bg-white shadow text-blue-600 font-bold" : "text-gray-500"}`}
            >
              Half
            </button>
            <button 
              onClick={() => setSelectedVariant("full")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${selectedVariant === "full" ? "bg-white shadow text-blue-600 font-bold" : "text-gray-500"}`}
            >
              Full
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="font-bold text-lg text-gray-900">₹{currentPrice}</span>
        <button 
          onClick={() => onAddToCart(item, selectedVariant, currentPrice)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-orange-600 active:scale-95 transition-transform"
        >
          ADD +
        </button>
      </div>
    </div>
  );
};

// --- Main Menu Component ---
const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Hardcoded for now - switch this based on user selection later
  const currentShopId = "shop_kravers"; 

  // 1. Fetch Menu from Firebase
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const q = query(collection(db, "menu"), where("shopId", "==", currentShopId));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenuItems(items);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // 2. Add Item to Cart Logic
  const addToCart = (item, variant, price) => {
    setCart((prevCart) => {
      // Create a unique ID for cart items (e.g., "Red Pasta-full")
      const cartItemId = variant ? `${item.id}-${variant}` : item.id;
      const itemName = variant ? `${item.name} (${variant})` : item.name;

      const existingItem = prevCart.find((cartItem) => cartItem.cartId === cartItemId);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.cartId === cartItemId
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { 
          ...item, 
          cartId: cartItemId, 
          name: itemName, // Overwrite name to include variant
          price: price,   // Overwrite price with selected variant price
          qty: 1, 
          variant: variant 
        }];
      }
    });
    setCartOpen(true);
  };

  // 3. Save Order to Firebase
  const saveOrderToFirebase = async (orderDetails) => {
    try {
      await addDoc(collection(db, "orders"), {
        items: orderDetails.items,
        totalBill: orderDetails.billDetails.grandTotal,
        billDetails: orderDetails.billDetails,
        status: "pending",
        shopName: "Kravers Kitchen", // You can make this dynamic
        shopId: currentShopId,
        studentId: "21UCS001", // Replace with real Auth ID later
        delivery: {
          type: orderDetails.orderType,
          location: orderDetails.deliveryLocation
        },
        timestamp: serverTimestamp(),
      });
      
      setOrderPlaced(true);
      setCart([]); // Clear cart
      setCartOpen(false);
      
      // Auto hide success message after 3 seconds
      setTimeout(() => setOrderPlaced(false), 3000);

    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Failed to place order. Try again.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Menu...</div>;

  // Group items by Category for cleaner display
  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">Kravers Kitchen 🍔</h1>
        <p className="text-gray-500 text-sm">Chinese, North Indian & Beverages</p>
      </div>

      {/* Success Notification */}
      {orderPlaced && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-bounce">
          ✅ Order Sent Successfully!
        </div>
      )}

      {/* Menu List */}
      <div className="p-4 space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h2 className="text-xl font-bold text-gray-700 mb-3 border-l-4 border-orange-500 pl-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems
                .filter(item => item.category === category)
                .map(item => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Component */}
      {cart.length > 0 && (
        <Cart 
          cartItems={cart} 
          shopId={currentShopId}
          onClose={() => setCartOpen(false)}
          onPlaceOrder={saveOrderToFirebase}
        />
      )}
    </div>
  );
};

export default Menu;