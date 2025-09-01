
import type{ Day } from "./calendar";
import type { JournalEntry } from "./journal";

export type EntriesByDate = Record<string, JournalEntry[]>;

export type MonthGeneratorFn = (year: number, month: number, entries: EntriesByDate) => Day[];