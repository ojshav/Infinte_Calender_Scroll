import type{ Day } from "./calendar";
import type{ JournalEntry  } from "./journal";

export interface HeaderProps {
  currentMonth: string; 
  onJumpToYear?: (year: number, month?: number) => void;
}

export interface CalendarGridProps {
  initialYear: number;
  initialMonth: number;
  entriesByDate: Record<string, JournalEntry[]>;
  onVisibleMonthChange?: (year: number, month: number) => void;
  onDayClick?: (entries: JournalEntry[]) => void;
  onJumpToYear?: (jumpFunction: (year: number, month?: number) => void) => void;
}

export interface MonthViewProps {
  year: number;
  month: number;
  entriesByDate: Record<string, JournalEntry[]>;
}

export interface DayCellProps {
  day: Day;
  onClick: (entries: JournalEntry[]) => void;
}

export interface JournalModalProps {
  entries: JournalEntry[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export interface JournalEntryCardProps {
  entry: JournalEntry;
}

export interface SwipeNavigatorProps {
  currentIndex: number;
  total: number;
  onNavigate: (newIndex: number) => void;
  children?: React.ReactNode;
}