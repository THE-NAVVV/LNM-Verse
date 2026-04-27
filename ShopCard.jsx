import React from 'react';

const ShopCard = ({ shop, onClick }) => {
  return (
    <div 
      onClick={() => onClick(shop)}
      className="bg-white p-4 rounded-none shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow mb-3"
    >
      {/* Shop Image */}
      <div className="w-16 h-16 bg-gray-200 rounded-none flex-shrink-0 overflow-hidden">
        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
      </div>

      {/* Shop Details */}
      <div>
        <h3 className="font-bold text-gray-800 text-lg">{shop.name}</h3>
        <p className="text-gray-500 text-sm">{shop.description}</p>
      </div>
    </div>
  );
};

export default ShopCard;