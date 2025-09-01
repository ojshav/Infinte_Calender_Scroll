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
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  
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
    // Start with just the current month to avoid showing other months first
    const currentMonth = generateMonths(
      initialYear,
      initialMonth,
      1, // Only generate current month initially
      entriesByDate
    );
    setMonths(currentMonth);
    setCurrentVisibleMonth({ year: initialYear, month: initialMonth });
    
    // Load additional months after a short delay to avoid blocking initial render
    const loadAdditionalMonths = setTimeout(() => {
      const initialMonths = generateMonths(
        initialYear,
        initialMonth - bufferMonths,
        bufferMonths * 2 + 1,
        entriesByDate
      );
      const uniqueInitialMonths = removeDuplicateMonths(initialMonths);
      
      // Sort months so current month appears first
      const sortedMonths = uniqueInitialMonths.sort((a, b) => {
        if (a.year === initialYear && a.month === initialMonth) return -1;
        if (b.year === initialYear && b.month === initialMonth) return 1;
        return 0;
      });
      
      setMonths(sortedMonths);
    }, 200);
    
    return () => clearTimeout(loadAdditionalMonths);
  }, [initialYear, initialMonth, bufferMonths, entriesByDate, removeDuplicateMonths]);

  // Load more months at the end
  const loadMoreMonthsEnd = useCallback(() => {
    if (isLoading || isScrollLocked) return;
    
    setIsLoading(true);
    setIsScrollLocked(true);
    
    setTimeout(() => {
      setMonths(prevMonths => {
        const lastMonth = prevMonths[prevMonths.length - 1];
        if (!lastMonth) return prevMonths;
        
        // Only load 2 months at a time to reduce lag
        const { year: nextYear, month: nextMonth } = getNextMonth(lastMonth.year, lastMonth.month);
        const newMonths = generateMonths(nextYear, nextMonth, 2, entriesByDate);
        
        // Filter out any duplicate months
        const existingKeys = new Set(prevMonths.map(m => `${m.year}-${m.month}`));
        const uniqueNewMonths = newMonths.filter(m => !existingKeys.has(`${m.year}-${m.month}`));
        
        return [...prevMonths, ...uniqueNewMonths];
      });
      
      setIsLoading(false);
      // Unlock scroll after a short delay
      setTimeout(() => setIsScrollLocked(false), 100);
    }, 50);
  }, [isLoading, isScrollLocked, bufferMonths, entriesByDate]);

  // Load more months at the beginning
  const loadMoreMonthsStart = useCallback(() => {
    if (isLoading || isScrollLocked) return;
    
    setIsLoading(true);
    setIsScrollLocked(true);
    
    setTimeout(() => {
      setMonths(prevMonths => {
        const firstMonth = prevMonths[0];
        if (!firstMonth) return prevMonths;
        
        // Only load 2 months at a time to reduce lag
        const { year: prevYear, month: prevMonth } = getPreviousMonth(firstMonth.year, firstMonth.month);
        const newMonths = generateMonths(prevYear, prevMonth, 2, entriesByDate);
        
        // Filter out any duplicate months
        const existingKeys = new Set(prevMonths.map(m => `${m.year}-${m.month}`));
        const uniqueNewMonths = newMonths.filter(m => !existingKeys.has(`${m.year}-${m.month}`));
        
        return [...uniqueNewMonths, ...prevMonths];
      });
      
      setIsLoading(false);
      // Unlock scroll after a short delay
      setTimeout(() => setIsScrollLocked(false), 100);
    }, 50);
  }, [isLoading, isScrollLocked, bufferMonths, entriesByDate]);

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
    if (!containerRef.current || isScrollLocked) return;
    
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Check if we need to load more at the bottom (only when close to bottom)
    if (scrollTop + clientHeight >= scrollHeight - 500) {
      loadMoreMonthsEnd();
    }
    
    // Check if we need to load more at the top (only when close to top)
    if (scrollTop <= 500) {
      const currentScrollTop = container.scrollTop;
      loadMoreMonthsStart();
      
      // Maintain scroll position after prepending months
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = currentScrollTop + 1000; // Reduced offset
        }
      }, 100); // Reduced delay
    }
    
    // Detect visible month
    detectVisibleMonth();
  }, [loadMoreMonthsEnd, loadMoreMonthsStart, detectVisibleMonth, isScrollLocked]);

  // Throttled scroll handler using useRef to avoid recreation
  const throttledScrollHandlerRef = useRef<(() => void) | null>(null);
  
  // Initialize throttled scroll handler once
  useEffect(() => {
    let ticking = false;
    let lastScrollTime = 0;
    const throttleDelay = 16; // ~60fps
    
    throttledScrollHandlerRef.current = () => {
      const now = Date.now();
      if (!ticking && now - lastScrollTime >= throttleDelay) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
          lastScrollTime = now;
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