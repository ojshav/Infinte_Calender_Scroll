import React, { useState, useEffect } from "react";
import type { HeaderProps } from "../types/props";

const Header: React.FC<HeaderProps> = ({ currentMonth, onJumpToYear }) => {
  const [displayMonth, setDisplayMonth] = useState(currentMonth);

  useEffect(() => {
    if (currentMonth !== displayMonth) {
      const timer = setTimeout(() => {
        setDisplayMonth(currentMonth);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentMonth, displayMonth]);

  const today = new Date();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Journal Calendar</h1>
            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span
                className="text-lg font-semibold text-gray-800 transition-all duration-300 ease-in-out"
                key={displayMonth}
              >
                {displayMonth}
              </span>
            </div>
          </div>

    
          <button
            onClick={() =>
              onJumpToYear?.(today.getFullYear(), today.getMonth())
            }
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Today
          </button>
        </div>

        
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>Scroll to move between months</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Green = Journal entries</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Starts at current month</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
