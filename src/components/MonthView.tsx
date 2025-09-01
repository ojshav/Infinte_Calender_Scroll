import React from 'react';
import type { MonthViewProps } from '../types/props';
import type { JournalEntry } from '../types/journal';
import { generateMonthDays, formatMonthYear } from '../utils/dateUtils';
import DayCell from './DayCell';

interface ExtendedMonthViewProps extends MonthViewProps {
  onDayClick?: (entries: JournalEntry[]) => void;
}

const MonthView: React.FC<ExtendedMonthViewProps> = ({ 
  year, 
  month, 
  entriesByDate,
  onDayClick
}) => {
  // Generate the 42-day grid for this month
  const days = generateMonthDays(year, month, entriesByDate);
  
  // Week day headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Handle day cell click
  const handleDayClick = (entries: JournalEntry[]) => {
    if (entries.length > 0) {
      onDayClick?.(entries);
    }
  };

  return (
    <div className="mb-8">
      {/* Month header */}
      <div className="mb-4 px-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {formatMonthYear(year, month)}
        </h2>
      </div>
      
      {/* Calendar grid container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <DayCell
              key={`${day.date.getTime()}-${index}`}
              day={day}
              onClick={handleDayClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthView;