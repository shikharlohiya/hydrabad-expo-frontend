import React from 'react';

const StatCard = ({ title, value, icon, color = "indigo" }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <div className="flex items-center">
      <div className={`text-2xl text-${color}-600 mr-4`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-gray-800`}>{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;