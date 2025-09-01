import type { Day, Month, EntriesByDate } from '../types/calendar';

/**
 * Get the first day of the month
 */
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

/**
 * Get the last day of the month
 */
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

/**
 * Get the number of days in a month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
 */
export const getFirstDayOfWeek = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format month and year for display (e.g., "September 2025")
 */
export const formatMonthYear = (year: number, month: number): string => {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

/**
 * Parse MM/DD/YYYY date string to ISO format (YYYY-MM-DD)
 */
export const parseMMDDYYYYToISO = (dateStr: string): string => {
  const [month, day, year] = dateStr.split('/');
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
};

/**
 * Parse DD/MM/YYYY date string to ISO format (YYYY-MM-DD)
 * For dates like "12/08/2025" meaning August 12, 2025
 */
export const parseDDMMYYYYToISO = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
};

/**
 * Generate a calendar grid for a specific month
 * Returns an array of 42 days (6 weeks × 7 days) to maintain consistent grid layout
 */
export const generateMonthDays = (
  year: number, 
  month: number, 
  entriesByDate: EntriesByDate
): Day[] => {
  const firstDay = getFirstDayOfWeek(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  
  const days: Day[] = [];
  
  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, dayNum);
    const isoDate = formatDateToISO(date);
    
    days.push({
      date,
      isCurrentMonth: false,
      journalEntries: entriesByDate[isoDate] || []
    });
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isoDate = formatDateToISO(date);
    
    days.push({
      date,
      isCurrentMonth: true,
      journalEntries: entriesByDate[isoDate] || []
    });
  }
  
  // Next month's leading days (to fill remaining slots for 6 weeks)
  const remainingSlots = 42 - days.length;
  for (let day = 1; day <= remainingSlots; day++) {
    const date = new Date(year, month + 1, day);
    const isoDate = formatDateToISO(date);
    
    days.push({
      date,
      isCurrentMonth: false,
      journalEntries: entriesByDate[isoDate] || []
    });
  }
  
  return days;
};

/**
 * Generate multiple months for infinite scroll
 */
export const generateMonths = (
  startYear: number,
  startMonth: number,
  count: number,
  entriesByDate: EntriesByDate
): Month[] => {
  const months: Month[] = [];
  
  for (let i = 0; i < count; i++) {
    // Calculate the correct year and month for each iteration
    const totalMonths = startMonth + i;
    const year = startYear + Math.floor(totalMonths / 12);
    const month = totalMonths % 12;
    
    months.push({
      year,
      month,
      days: generateMonthDays(year, month, entriesByDate)
    });
  }
  
  return months;
};

/**
 * Get the month and year from a date
 */
export const getMonthYear = (date: Date): { year: number; month: number } => {
  return {
    year: date.getFullYear(),
    month: date.getMonth()
  };
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Get the previous month
 */
export const getPreviousMonth = (year: number, month: number): { year: number; month: number } => {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
};

/**
 * Get the next month
 */
export const getNextMonth = (year: number, month: number): { year: number; month: number } => {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
};