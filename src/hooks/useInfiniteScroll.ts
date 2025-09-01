import { useState, useEffect, useCallback, useRef } from 'react';
import type { Month, EntriesByDate } from '../types/calendar';
import { generateMonths, getNextMonth, getPreviousMonth } from '../utils/dateUtils';

interface UseInfiniteScrollProps {
  initialYear: number;
  initialMonth: number;
  entriesByDate: EntriesByDate;
  bufferMonths?: number; // Number of months to load ahead/behind
}

interface UseInfiniteScrollReturn {
  months: Month[];
  currentVisibleMonth: { year: number; month: number } | null;
  containerRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  jumpToYear: (targetYear: number, targetMonth?: number) => void;
}

export const useInfiniteScroll = ({
  initialYear,
  initialMonth,
  entriesByDate,
  bufferMonths = 6
}: UseInfiniteScrollProps): UseInfiniteScrollReturn => {
  const containerRef = useRef<HTMLDivElement>(null!);
  const [months, setMonths] = useState<Month[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentVisibleMonth, setCurrentVisibleMonth] = useState<{ year: number; month: number } | null>(null);

  // Helper function to remove duplicate months
  const removeDuplicateMonths = useCallback((months: Month[]) => {
    const seen = new Set<string>();
    return months.filter(month => {
      const key = `${month.year}-${month.month}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, []);

  // Initialize months on mount
  useEffect(() => {
    const initialMonths = generateMonths(
      initialYear,
      initialMonth - bufferMonths,
      bufferMonths * 2 + 1,
      entriesByDate
    );
    // Remove any duplicates from initial generation
    const uniqueInitialMonths = removeDuplicateMonths(initialMonths);
    setMonths(uniqueInitialMonths);
    setCurrentVisibleMonth({ year: initialYear, month: initialMonth });
    
    // Auto-scroll to current month after a short delay to ensure rendering
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const currentMonthElement = containerRef.current.querySelector(`[data-month="${initialYear}-${initialMonth}"]`);
        if (currentMonthElement) {
          currentMonthElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [initialYear, initialMonth, bufferMonths, entriesByDate, removeDuplicateMonths]);

  // Load more months at the end
  const loadMoreMonthsEnd = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setMonths(prevMonths => {
        const lastMonth = prevMonths[prevMonths.length - 1];
        if (!lastMonth) return prevMonths;
        
        // Generate months starting from the month after the last one
        const { year: nextYear, month: nextMonth } = getNextMonth(lastMonth.year, lastMonth.month);
        const newMonths = generateMonths(nextYear, nextMonth, bufferMonths, entriesByDate);
        
        // Filter out any duplicate months
        const existingKeys = new Set(prevMonths.map(m => `${m.year}-${m.month}`));
        const uniqueNewMonths = newMonths.filter(m => !existingKeys.has(`${m.year}-${m.month}`));
        
        return [...prevMonths, ...uniqueNewMonths];
      });
      
      setIsLoading(false);
    }, 100);
  }, [isLoading, bufferMonths, entriesByDate]);

  // Load more months at the beginning
  const loadMoreMonthsStart = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setMonths(prevMonths => {
        const firstMonth = prevMonths[0];
        if (!firstMonth) return prevMonths;
        
        // Generate months ending before the first one
        const { year: prevYear, month: prevMonth } = getPreviousMonth(firstMonth.year, firstMonth.month);
        const newMonths = generateMonths(prevYear, prevMonth, bufferMonths, entriesByDate);
        
        // Filter out any duplicate months
        const existingKeys = new Set(prevMonths.map(m => `${m.year}-${m.month}`));
        const uniqueNewMonths = newMonths.filter(m => !existingKeys.has(`${m.year}-${m.month}`));
        
        return [...uniqueNewMonths, ...prevMonths];
      });
      
      setIsLoading(false);
    }, 100);
  }, [isLoading, bufferMonths, entriesByDate]);

  // Jump to a specific year and month
  const jumpToYear = useCallback((targetYear: number, targetMonth: number = 0) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      // Generate months centered around the target year/month
      const newMonths = generateMonths(
        targetYear,
        targetMonth - bufferMonths,
        bufferMonths * 2 + 1,
        entriesByDate
      );
      
      // Remove any duplicates from the new months
      const uniqueNewMonths = removeDuplicateMonths(newMonths);
      setMonths(uniqueNewMonths);
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
    
    // Check if we need to update the visible month
    if (closestYear > 0 && closestMonth > 0) {
      const shouldUpdate = !currentVisibleMonth || 
        closestYear !== currentVisibleMonth.year ||
        closestMonth !== currentVisibleMonth.month;
      
      if (shouldUpdate) {
        setCurrentVisibleMonth({ year: closestYear, month: closestMonth });
      }
    }
  }, []); // Remove currentVisibleMonth dependency to avoid circular updates

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Check if we need to load more at the bottom
    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      loadMoreMonthsEnd();
    }
    
    // Check if we need to load more at the top
    if (scrollTop <= 1000) {
      const currentScrollTop = container.scrollTop;
      loadMoreMonthsStart();
      
      // Maintain scroll position after prepending months
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = currentScrollTop + 2000;
        }
      }, 150);
    }
    
    // Detect visible month
    detectVisibleMonth();
  }, [loadMoreMonthsEnd, loadMoreMonthsStart, detectVisibleMonth]);

  // Throttled scroll handler using useRef to avoid recreation
  const throttledScrollHandlerRef = useRef<(() => void) | null>(null);
  
  // Initialize throttled scroll handler once
  useEffect(() => {
    let ticking = false;
    
    throttledScrollHandlerRef.current = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [handleScroll]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const scrollHandler = throttledScrollHandlerRef.current;
    if (!scrollHandler) return;
    
    container.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Initial visible month detection
    setTimeout(() => detectVisibleMonth(), 100);
    
    return () => {
      container.removeEventListener('scroll', scrollHandler);
    };
  }, [detectVisibleMonth]); // Only depend on detectVisibleMonth

  return {
    months,
    currentVisibleMonth,
    containerRef,
    isLoading,
    jumpToYear
  };
};