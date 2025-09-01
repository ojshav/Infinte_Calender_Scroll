import React, { useState, useEffect } from 'react';
import type { JournalEntry } from '../types/journal';
import MonthView from './MonthView';
import { generateMonthDays } from '../utils/dateUtils';

interface ExtendedCalendarGridProps {
  initialYear: number;
  initialMonth: number;
  entriesByDate: Record<string, JournalEntry[]>;
  onVisibleMonthChange?: (year: number, month: number) => void;
  onDayClick?: (entries: JournalEntry[]) => void;
  onJumpToYear?: (jumpFunction: (year: number, month?: number) => void) => void;
}

const CalendarGrid: React.FC<ExtendedCalendarGridProps> = ({
  initialYear,
  initialMonth,
  entriesByDate,
  onVisibleMonthChange,
  onDayClick,
  onJumpToYear
}) => {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // Generate current month days
  const currentMonthDays = generateMonthDays(currentYear, currentMonth, entriesByDate);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Jump to specific year/month
  const jumpToYear = (year: number, month?: number) => {
    setCurrentYear(year);
    setCurrentMonth(month ?? 0);
  };

  // Notify parent of visible month changes
  useEffect(() => {
    if (onVisibleMonthChange) {
      onVisibleMonthChange(currentYear, currentMonth);
    }
  }, [currentYear, currentMonth, onVisibleMonthChange]);

  // Expose jumpToYear function to parent
  useEffect(() => {
    if (onJumpToYear) {
      onJumpToYear(jumpToYear);
    }
  }, [onJumpToYear]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-lg font-semibold text-gray-800">
            {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar month view - now scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="min-h-full flex items-start justify-center">
            <MonthView
              year={currentYear}
              month={currentMonth}
              entriesByDate={entriesByDate}
              onDayClick={onDayClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;