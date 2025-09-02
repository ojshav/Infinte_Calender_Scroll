import type{  JournalEntry } from "./journal"; 
export interface Day {
  date: Date;
  isCurrentMonth: boolean;  
  journalEntries: JournalEntry[];
}

export interface Month {
  year: number;
  month: number;
  days: Day[];
}

export type EntriesByDate = Record<string, JournalEntry[]>;
