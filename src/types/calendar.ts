import type{  JournalEntry } from "./journal"; 
export interface Day {
  date: Date;
  isCurrentMonth: boolean;  // true if the day is in the current month
  journalEntries: JournalEntry[];
}

export interface Month {
  year: number;
  month: number;
  days: Day[];
}

// Added definition for EntriesByDate type
export type EntriesByDate = Record<string, JournalEntry[]>;
