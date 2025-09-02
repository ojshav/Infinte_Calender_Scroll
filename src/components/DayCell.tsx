import React from 'react';
import type { DayCellProps } from '../types/props';
import { isToday } from '../utils/dateUtils';

const DayCell: React.FC<DayCellProps> = ({ day, onClick }) => {
const {date, isCurrentMonth,journalEntries} = day;
const daynumber = date.getDate();
const hasEntries = isCurrentMonth && journalEntries.length > 0;
const isTodayDate = isToday(date);

const isClickable = hasEntries;

const topEntry = isCurrentMonth && journalEntries.length > 0  ? journalEntries[0] : null;

const handleClick = () => {
    if (isClickable) {
        onClick(journalEntries);
    }
};
return (
    <div className={`relative min-h-16 sm:min-h20 p-1 sm:p-1 border-r border-b border-gray-200 last:border-r-0 ${isClickable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
    ${!isCurrentMonth ? 'bg-gray-25' : 'bg-white'}`}
    onClick={handleClick}
    role={isClickable ? 'button' : undefined}
    tabIndex={isClickable ? 0 : -1}
    onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
        }
    }}
    >
   <div className="flex justify-between items-start mb-1">
        <span
          className={`
            text-xs sm:text-sm font-medium
            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
            ${isTodayDate ? 'text-blue-600 font-semibold' : ''}
          `}
        >
          {daynumber}
        </span>
      {isTodayDate && (
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full"></div>
        )}
      </div>

    {hasEntries && topEntry && (
        <div className='space-y-1'>
            <div className="flex items-center justify-between mb-1">
                <div className='flex items-center space-x-1'>
                    <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full'></div>
                {journalEntries.length > 1 && (
                    <span className='text-xs text-gray-600 hidden sm:block'>
                        {journalEntries.length} entries
                    </span>
                )}
                </div>
<div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < Math.floor(topEntry.rating) 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
        </div>
<div className="relative">
            <img
              src={topEntry.imgUrl}
              alt="Journal entry"
              className="w-full h-12 sm:h-16 object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA3NUgxMjVWMTI1SDc1Vjc1WiIgZmlsbD0iI0Q0RDRENyIvPgo8L3N2Zz4K';
              }}
            />
{journalEntries.length > 1 && (
              <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                +{journalEntries.length - 1}
              </div>
            )}
          </div>
{topEntry.categories.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1">
              {topEntry.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded"
                >
                  {category}
                </span>
              ))}
              {topEntry.categories.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{topEntry.categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      )}

{isClickable && (
        <div className="absolute inset-0 bg-blue-50 opacity-0 hover:opacity-20 transition-opacity pointer-events-none"></div>
      )}
    </div>
  );
};

export default DayCell;
