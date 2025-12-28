import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  FaArrowLeft,
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMotorcycle,
  FaUtensils,
  FaCut
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Latest first
        ordersData.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });

        setOrders(ordersData);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  // --- STATUS COLOR (ADMIN LOGIC KE CLOSE) ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing':
      case 'washing':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ready':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse';
      case 'completed':
      case 'collected':
      case 'closed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // --- STATUS LABEL (SALON VS FOOD) ---
  const getStatusLabel = (order) => {
    const status = order.status || 'pending';
    const isSalon = order.shopId === 'shop_salon';

    if (status === 'ready') return isSalon ? 'Service Done' : 'Ready';
    if (status === 'preparing' || status === 'washing')
      return isSalon ? 'In Service' : 'Preparing';
    if (status === 'accepted') return isSalon ? 'Slot Confirmed' : 'Accepted';
    if (status === 'completed' || status === 'collected' || status === 'closed')
      return 'Completed';
    if (status === 'rejected') return 'Rejected';
    if (status === 'pending') return 'Pending';

    return status;
  };

  // --- ACTIVE VS HISTORY SPLIT ---
  const ACTIVE_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'washing'];
  const HISTORY_STATUSES = ['completed', 'rejected', 'collected', 'closed'];

  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes((o.status || '').toLowerCase())
  );
  const pastOrders = orders.filter((o) =>
    HISTORY_STATUSES.includes((o.status || '').toLowerCase())
  );

  const renderStatusIcon = (order) => {
    const status = order.status || 'pending';
    if (['completed', 'collected', 'closed'].includes(status))
      return <FaCheckCircle className="text-green-500" />;
    if (status === 'rejected')
      return <FaTimesCircle className="text-red-500" />;
    if (['pending', 'preparing', 'washing', 'accepted', 'ready'].includes(status))
      return <FaClock className="text-orange-500" />;
    return <FaClock className="text-gray-400" />;
  };

  const renderOrderCard = (order) => {
    const isSalon = order.shopId === 'shop_salon';
    const statusLabel = getStatusLabel(order);
    const statusColor = getStatusColor(order.status);

    return (
      <div
        key={order.id}
        className="bg-white p-4 rounded-none shadow-sm border border-gray-100 relative overflow-hidden"
      >
        {/* Order Header */}
        <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {isSalon ? 'Salon Appointment' : 'Food Order'}
            </p>
            <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
              {order.shopName || (isSalon ? 'Campus Salon' : 'Order')}
              {isSalon ? (
                <FaCut className="text-purple-500" />
              ) : (
                <FaUtensils className="text-teal-500" />
              )}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              ID: #{order.id.slice(-5)} •{' '}
              {order.timestamp
                ? order.timestamp
                    .toDate()
                    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-none text-[10px] font-black uppercase border ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-none font-bold mr-2 text-gray-500">
                  {item.qty}x
                </span>
                {item.name}
              </span>
              <span className="font-bold text-gray-400">
                ₹{item.price * item.qty}
              </span>
            </div>
          ))}
        </div>

        {/* Footer: Total & Status Icon + Order Type */}
        <div className="flex justify-between items-center pt-2 bg-gray-50 -mx-4 -mb-4 p-4 mt-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              To Pay
            </p>
            <p className="text-xl font-black text-teal-800">
              ₹{order.totalAmount}
            </p>

            {/* Order Method small line */}
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
              {order.orderType === 'pickup' && (
                <>
                  <FaMotorcycle className="rotate-180 text-blue-500" />
                  <span>Takeaway</span>
                </>
              )}
              {order.orderType === 'delivery' && (
                <>
                  <FaMotorcycle className="text-orange-500" />
                  <span>Delivery</span>
                </>
              )}
              {order.orderType === 'dinein' && <span>Dine-In</span>}
              {order.orderType === 'appointment' && (
                <>
                  <FaClock className="text-purple-500" />
                  <span>{order.timeSlot || 'Slot'}</span>
                </>
              )}
            </div>
          </div>

          {/* Status Icon Indicator */}
          <div className="text-2xl opacity-20">
            {renderStatusIcon(order)}
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-700 font-bold">
        Loading Orders...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-teal-700 p-4 text-white flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button
          onClick={() => navigate('/canteen')}
          className="bg-white/20 p-2 rounded-full"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Active Orders */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-2">
            Current Orders
          </h2>
          {activeOrders.length === 0 ? (
            <p className="text-xs text-gray-400">No active orders right now.</p>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => renderOrderCard(order))}
            </div>
          )}
        </section>

        {/* History */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-2">
            Order History
          </h2>
          {pastOrders.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <FaShoppingBag
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-bold text-gray-500">No past orders</p>
              <Link
                to="/canteen"
                className="text-teal-600 font-bold text-xs mt-1 block"
              >
                Order something now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pastOrders.map((order) => renderOrderCard(order))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyOrders;
