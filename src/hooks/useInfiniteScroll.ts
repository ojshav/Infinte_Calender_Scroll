
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
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  const [isLoadingBottom, setIsLoadingBottom] = useState(false);
  const [currentVisibleMonth, setCurrentVisibleMonth] = useState<{ year: number; month: number } | null>(null);

  
  useEffect(() => {
    
    const startMonth = initialMonth - bufferMonths;
    const totalMonths = bufferMonths * 2 + 1; 
    
 
    
    const initialMonths = generateMonths(
      initialYear,
      startMonth,
      totalMonths,
      entriesByDate
    );
    
    
    
    setMonths(initialMonths);
    setCurrentVisibleMonth({ year: initialYear, month: initialMonth });
    
    
    setTimeout(() => {
      if (containerRef.current) {
        const currentMonthElement = containerRef.current.querySelector(`[data-month="${initialYear}-${initialMonth}"]`);
        if (currentMonthElement) {
       
          currentMonthElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        } else {
          console.warn(`useInfiniteScroll: Current month element not found for ${initialYear}-${initialMonth}`);
        }
      }
    }, 100);
  }, [initialYear, initialMonth, bufferMonths, entriesByDate]);

  
  const loadMoreMonthsEnd = useCallback(() => {
    if (isLoadingBottom) return;
    
    setIsLoadingBottom(true);
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
      
      setIsLoadingBottom(false);
    }, 100);
  }, [isLoadingBottom, entriesByDate]);


  const loadMoreMonthsStart = useCallback(() => {
    if (isLoadingTop) return;
    
    setIsLoadingTop(true);
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
      
      setIsLoadingTop(false);
    }, 100);
  }, [isLoadingTop, entriesByDate]);

  // Jump to a specific year and month
  const jumpToYear = useCallback((targetYear: number, targetMonth: number = 0) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
     
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


  const detectVisibleMonth = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;
    

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
    

    if (scrollTop <= 300) {
      
      const currentScrollTop = container.scrollTop;
      const currentScrollHeight = container.scrollHeight;
      
      // Load the new month
      loadMoreMonthsStart();
      
      setTimeout(() => {
        if (containerRef.current) {
          const newScrollHeight = containerRef.current.scrollHeight;
          const heightDifference = newScrollHeight - currentScrollHeight;
          
         
          if (heightDifference > 0) {
 
            containerRef.current.scrollTo({
              top: currentScrollTop + heightDifference,
              behavior: 'smooth'
            });
          }
        }
      }, 150); 
    }
  }, [loadMoreMonthsEnd, loadMoreMonthsStart]);

  
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
    isLoading: isLoading || isLoadingTop || isLoadingBottom,
    jumpToYear
  };
};