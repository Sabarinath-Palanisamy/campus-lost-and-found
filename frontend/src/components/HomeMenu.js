import React from 'react';
import { Search, PlusCircle } from 'lucide-react';

export default function HomeMenu({ onSearchClick, onReportClick, onMyItemsClick }) {
  const menuOptions = [
    {
      title: "Looking for an Item",
      description: "Search through reported items using specific details.",
      icon: <Search size={32} className="text-blue-500 mb-4" />,
      onClick: onSearchClick,
      hoverColor: "hover:border-blue-500"
    },
    {
      title: "Report an Item",
      description: "Found or lost something? Report it immediately.",
      icon: <PlusCircle size={32} className="text-emerald-500 mb-4" />,
      onClick: onReportClick,
      hoverColor: "hover:border-emerald-500"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">What would you like to do today?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {menuOptions.map((option, idx) => (
          <button 
            key={idx}
            onClick={option.onClick}
            className={`bg-white p-8 rounded-xl shadow-sm border-2 border-transparent transition-all flex flex-col items-center text-center group ${option.hoverColor}`}
          >
            <div className="scale-100 group-hover:scale-110 transition-transform">
              {option.icon}
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">{option.title}</h3>
            <p className="text-sm text-slate-500">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}