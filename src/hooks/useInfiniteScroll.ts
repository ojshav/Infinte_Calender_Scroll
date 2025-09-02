import { useState, useEffect, useCallback, useRef } from 'react';
import type { Month, EntriesByDate } from '../types/calendar';
import { generateMonths } from '../utils/dateUtils';

interface UseInfiniteScrollProps {
  initialYear: number;
  initialMonth: number;
  entriesByDate: EntriesByDate;
  bufferMonths?: number;
}

interface UseInfiniteScrollReturn {
  months: Month[];
  currentVisibleMonth: { year: number; month: number } | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  jumpToYear: (targetYear: number, targetMonth?: number) => void;
}

export const useInfiniteScroll = ({
  initialYear,
  initialMonth,
  entriesByDate,
  bufferMonths = 3
}: UseInfiniteScrollProps): UseInfiniteScrollReturn => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [months, setMonths] = useState<Month[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVisibleMonth, setCurrentVisibleMonth] = useState<{ year: number; month: number } | null>(null);

  // Initialize months on mount - center on current month
  useEffect(() => {
    // Generate months centered around the current month
    const startMonth = initialMonth - bufferMonths;
    const totalMonths = bufferMonths * 2 + 1; // Total months to generate
    
    console.log(`useInfiniteScroll: Generating ${totalMonths} months starting from ${startMonth} (${initialYear}-${startMonth})`);
    console.log(`useInfiniteScroll: Target month is ${initialYear}-${initialMonth} (${initialMonth})`);
    
    const initialMonths = generateMonths(
      initialYear,
      startMonth,
      totalMonths,
      entriesByDate
    );
    
    console.log(`useInfiniteScroll: Generated months:`, initialMonths.map(m => `${m.year}-${m.month}`));
    
    setMonths(initialMonths);
    setCurrentVisibleMonth({ year: initialYear, month: initialMonth });
    
    // Scroll to current month after a short delay to ensure DOM is ready
    setTimeout(() => {
      if (containerRef.current) {
        const currentMonthElement = containerRef.current.querySelector(`[data-month="${initialYear}-${initialMonth}"]`);
        if (currentMonthElement) {
          console.log(`useInfiniteScroll: Scrolling to current month ${initialYear}-${initialMonth}`);
          currentMonthElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        } else {
          console.log(`useInfiniteScroll: Current month element not found for ${initialYear}-${initialMonth}`);
        }
      }
    }, 100);
  }, [initialYear, initialMonth, bufferMonths, entriesByDate]);

  // Load more months at the end
  const loadMoreMonthsEnd = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setMonths(prevMonths => {
        const lastMonth = prevMonths[prevMonths.length - 1];
        if (!lastMonth) return prevMonths;
        
        // Calculate next month
        let nextYear = lastMonth.year;
        let nextMonth = lastMonth.month + 1;
        
        if (nextMonth >= 12) {
          nextMonth = 0;
          nextYear += 1;
        }
        
        const newMonth = generateMonths(nextYear, nextMonth, 1, entriesByDate)[0];
        return [...prevMonths, newMonth];
      });
      
      setIsLoading(false);
    }, 100);
  }, [isLoading, entriesByDate]);

  // Load more months at the beginning
  const loadMoreMonthsStart = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setMonths(prevMonths => {
        const firstMonth = prevMonths[0];
        if (!firstMonth) return prevMonths;
        
        // Calculate previous month
        let prevYear = firstMonth.year;
        let prevMonth = firstMonth.month - 1;
        
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear -= 1;
        }
        
        const newMonth = generateMonths(prevYear, prevMonth, 1, entriesByDate)[0];
        return [newMonth, ...prevMonths];
      });
      
      setIsLoading(false);
    }, 100);
  }, [isLoading, entriesByDate]);

  // Jump to a specific year and month
  const jumpToYear = useCallback((targetYear: number, targetMonth: number = 0) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      // Generate months centered around the target year/month
      const startMonth = targetMonth - bufferMonths;
      const totalMonths = bufferMonths * 2 + 1;
      
      const newMonths = generateMonths(
        targetYear,
        startMonth,
        totalMonths,
        entriesByDate
      );
      
      setMonths(newMonths);
      setCurrentVisibleMonth({ year: targetYear, month: targetMonth });
      setIsLoading(false);
      
      // Scroll to the target month
      setTimeout(() => {
        if (containerRef.current) {
          const targetElement = containerRef.current.querySelector(`[data-month="${targetYear}-${targetMonth}"]`);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }, 100);
  }, [isLoading, bufferMonths, entriesByDate]);

  // Detect which month is currently most visible
  const detectVisibleMonth = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;
    
    // Find all month elements
    const monthElements = container.querySelectorAll('[data-month]');
    let closestYear = 0;
    let closestMonth = 0;
    let minDistance = Infinity;
    
    monthElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - containerCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        const monthData = element.getAttribute('data-month');
        if (monthData) {
          const [year, month] = monthData.split('-').map(Number);
          closestYear = year;
          closestMonth = month;
        }
      }
    });
    
    // Update visible month if it changed
    if (closestYear > 0 && closestMonth >= 0) {
      setCurrentVisibleMonth(prev => {
        if (!prev || prev.year !== closestYear || prev.month !== closestMonth) {
          return { year: closestYear, month: closestMonth };
        }
        return prev;
      });
    }
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Load more months at the bottom
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      loadMoreMonthsEnd();
    }
    
    // Load more months at the top
    if (scrollTop <= 300) {
      const currentScrollTop = container.scrollTop;
      loadMoreMonthsStart();
      
      // Maintain scroll position after prepending months
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = currentScrollTop + 800;
        }
      }, 100);
    }
  }, [loadMoreMonthsEnd, loadMoreMonthsStart]);

  // Set up scroll listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let scrollTimeout: number;
    
    const handleScrollWithThrottle = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        handleScroll();
        detectVisibleMonth();
      }, 100);
    };
    
    container.addEventListener('scroll', handleScrollWithThrottle, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScrollWithThrottle);
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll, detectVisibleMonth]);

  return {
    months,
    currentVisibleMonth,
    containerRef,
    isLoading,
    jumpToYear
  };
};