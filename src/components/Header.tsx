import React, { useState, useEffect } from 'react';
import type { HeaderProps } from '../types/props';

const Header: React.FC<HeaderProps> = ({ currentMonth, onJumpToYear }) => {
  const [showYearInput, setShowYearInput] = useState(false);
  const [yearInput, setYearInput] = useState('');
  const [displayMonth, setDisplayMonth] = useState(currentMonth);

  // Smoothly update the displayed month
  useEffect(() => {
    if (currentMonth !== displayMonth) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setDisplayMonth(currentMonth);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentMonth, displayMonth]);

  // Get current date for "today" reference
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  // Handle year jump
  const handleYearJump = () => {
    const year = parseInt(yearInput);
    if (year >= 1900 && year <= 2100) {
      onJumpToYear?.(year, 0); // Jump to January of the selected year
      setYearInput('');
      setShowYearInput(false);
    }
  };

  // Quick jump to common years
  const quickJumpYears = [2020, 2021, 2022, 2023, 2024, 2025];

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* App title and current month */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              Journal Calendar
            </h1>
            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span 
                className="text-lg font-semibold text-gray-800 transition-all duration-300 ease-in-out"
                key={displayMonth} // Force re-render for smooth transition
              >
                {displayMonth}
              </span>
            </div>
          </div>
          
          {/* Today indicator and year navigation */}
          <div className="flex items-center space-x-4">
            {/* Year navigation */}
            <div className="flex items-center space-x-2">
              {!showYearInput ? (
                <button
                  onClick={() => setShowYearInput(true)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Jump to Year
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    placeholder="2020"
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1900"
                    max="2100"
                  />
                  <button
                    onClick={handleYearJump}
                    className="px-2 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Go
                  </button>
                  <button
                    onClick={() => {
                      setShowYearInput(false);
                      setYearInput('');
                    }}
                    className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Quick year buttons */}
            <div className="hidden sm:flex items-center space-x-1">
              {quickJumpYears.map((year) => (
                <button
                  key={year}
                  onClick={() => onJumpToYear?.(year, 0)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    year === today.getFullYear()
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            
            {/* Today button */}
            <button
              onClick={() => onJumpToYear?.(today.getFullYear(), today.getMonth())}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Today
            </button>
          </div>
        </div>
        
        {/* Navigation hint */}
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>Scroll to navigate months</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Journal entries</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Use "Jump to Year" for quick navigation</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Infinite scroll loads months automatically</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;