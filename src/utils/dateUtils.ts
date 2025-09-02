import type { Day, Month, EntriesByDate } from "../types/calendar";

export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstWeekdayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatMonthYear = (year: number, month: number): string => {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });
};

export const parseIndianDateToISO = (dateStr: string): string => {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const formatISOToIndianDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

export const generateMonthDays = (
  year: number,
  month: number,
  entries: EntriesByDate
): Day[] => {
  const firstWeekday = getFirstWeekdayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const days: Day[] = [];

  // Previous month days
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, dayNum);
    const isoDate = formatDateToISO(date);

    days.push({
      date,
      isCurrentMonth: false,
      journalEntries: entries[isoDate] || [],
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isoDate = formatDateToISO(date);

    days.push({
      date,
      isCurrentMonth: true,
      journalEntries: entries[isoDate] || [],
    });
  }

  // Next month days
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    const isoDate = formatDateToISO(date);

    days.push({
      date,
      isCurrentMonth: false,
      journalEntries: entries[isoDate] || [],
    });
  }

  return days;
};

export const generateMonths = (
  startYear: number,
  startMonth: number,
  count: number,
  entries: EntriesByDate
): Month[] => {
  const months: Month[] = [];

  for (let i = 0; i < count; i++) {
    let year = startYear;
    let month = startMonth + i;

    if (month < 0) {
      year -= Math.ceil(Math.abs(month) / 12);
      month = 12 + (month % 12);
    } else if (month >= 12) {
      year += Math.floor(month / 12);
      month = month % 12;
    }

    months.push({
      year,
      month,
      days: generateMonthDays(year, month, entries),
    });
  }

  return months;
};

export const getMonthYear = (date: Date): { year: number; month: number } => {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getPreviousMonth = (
  year: number,
  month: number
): { year: number; month: number } => {
  if (month === 0) {
    return {
      year: year - 1,
      month: 11,
    };
  }
  return {
    year,
    month: month - 1,
  };
};

export const getNextMonth = (
  year: number,
  month: number
): { year: number; month: number } => {
  if (month === 11) {
    return {
      year: year + 1,
      month: 0,
    };
  }
  return {
    year,
    month: month + 1,
  };
};
