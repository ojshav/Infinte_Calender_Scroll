import React, { useEffect } from 'react';
import type { JournalEntry } from '../types/journal';
import MonthView from './MonthView';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

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
  // Use infinite scroll hook for smooth month navigation
  const { months, currentVisibleMonth, containerRef, isLoading, jumpToYear } = useInfiniteScroll({
    initialYear,
    initialMonth,
    entriesByDate,
    bufferMonths: 3
  });

  // Notify parent of visible month changes
  useEffect(() => {
    if (currentVisibleMonth && onVisibleMonthChange) {
      onVisibleMonthChange(currentVisibleMonth.year, currentVisibleMonth.month);
    }
  }, [currentVisibleMonth, onVisibleMonthChange]);

  // Expose jumpToYear function to parent
  useEffect(() => {
    if (onJumpToYear) {
      onJumpToYear(jumpToYear);
    }
  }, [jumpToYear, onJumpToYear]);

  return (
    <div className="flex-1 overflow-hidden">
      {/* Scroll container for infinite months */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth custom-scrollbar"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Loading indicator at top - only show when loading previous months */}
        {isLoading && (
          <div className="flex justify-center py-3 sm:py-4 animate-fade-in">
            <div className="flex items-center space-x-2 text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="text-xs sm:text-sm font-medium">Loading previous months...</span>
            </div>
          </div>
        )}
        
        {/* Calendar months */}
        <div className="px-2 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-8">
          {months.map((month, index) => (
            <div
              key={`${month.year}-${month.month}-${index}`}
              data-month={`${month.year}-${month.month}`}
              className={`transition-all duration-500 ease-out transform hover:scale-[1.01] hover:shadow-md rounded-lg overflow-hidden ${
                currentVisibleMonth && 
                currentVisibleMonth.year === month.year && 
                currentVisibleMonth.month === month.month
                  ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg bg-blue-50/30'
                  : 'bg-white shadow-sm'
              } animate-fade-in-up`}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Month content */}
              <div className="p-2 sm:p-4">
                <MonthView
                  year={month.year}
                  month={month.month}
                  entriesByDate={entriesByDate}
                  onDayClick={onDayClick}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading indicator at bottom - only show when loading more months */}
        {isLoading && (
          <div className="flex justify-center py-3 sm:py-4 animate-fade-in">
            <div className="flex items-center space-x-2 text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="text-xs sm:text-sm font-medium">Loading more months...</span>
            </div>
          </div>
        )}
        
        {/* Scroll padding for better UX */}
        <div className="h-16 sm:h-20"></div>
      </div>
    </div>
  );
};

export default CalendarGrid;