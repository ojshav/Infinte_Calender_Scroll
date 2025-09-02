import type { JournalEntry } from "../types/journal";
import type { EntriesByDate } from "../types/calendar";
import { parseIndianDateToISO } from "./dateUtils"; 


interface RawJournalEntry {
  imgUrl: string;
  rating: number;
  categories: string[];
  date: string; 
  description: string;
}

// Create a unique ID for each entry
const generateEntryId = (entry: RawJournalEntry, index: number): string => {
  const dateHash = entry.date.replace(/\//g, "");
  return `entry_${dateHash}_${index}`;
};


const transformRawEntry = (raw: RawJournalEntry, index: number): JournalEntry => ({
  id: generateEntryId(raw, index),
  date: parseIndianDateToISO(raw.date), // DD/MM/YYYY → YYYY-MM-DD
  imgUrl: raw.imgUrl,
  rating: raw.rating,
  categories: raw.categories,
  description: raw.description,
});


export const loadJournalEntries = async (jsonData: RawJournalEntry[]): Promise<JournalEntry[]> => {
  try {
    const entries = jsonData.map((raw, index) => transformRawEntry(raw, index));
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error loading journal entries:", error);
    return [];
  }
};


export const groupEntriesByDate = (entries: JournalEntry[]): EntriesByDate => {
  const grouped: EntriesByDate = {};

  entries.forEach(entry => {
    if (!grouped[entry.date]) grouped[entry.date] = [];
    grouped[entry.date].push(entry);
  });

  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => b.rating - a.rating);
  });

  return grouped;
};


export const loadJournalData = async (
  dataSource: string | RawJournalEntry[]
): Promise<EntriesByDate> => {
  try {
    let rawData: RawJournalEntry[];

    if (typeof dataSource === "string") {
      const response = await fetch(dataSource);
      if (!response.ok) throw new Error(`Failed to load data: ${response.statusText}`);
      rawData = await response.json();
    } else {
      rawData = dataSource;
    }

    const entries = await loadJournalEntries(rawData);
    return groupEntriesByDate(entries);
  } catch (error) {
    console.error("Error loading journal data:", error);
    return {};
  }
};


export const getEntriesForDate = (date: Date, entriesByDate: EntriesByDate): JournalEntry[] => {
  const isoDate = date.toISOString().split("T")[0]; // yyyy-mm-dd
  return entriesByDate[isoDate] || [];
};


export const getEntriesInRange = (
  startDate: Date,
  endDate: Date,
  entriesByDate: EntriesByDate
): JournalEntry[] => {
  const entries: JournalEntry[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    entries.push(...getEntriesForDate(currentDate, entriesByDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const getEntriesByCategory = (
  category: string,
  entriesByDate: EntriesByDate
): JournalEntry[] => {
  const allEntries = Object.values(entriesByDate).flat();
  return allEntries.filter(entry =>
    entry.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
  );
};


export const getEntriesByMinRating = (
  minRating: number,
  entriesByDate: EntriesByDate
): JournalEntry[] => {
  const allEntries = Object.values(entriesByDate).flat();
  return allEntries.filter(entry => entry.rating >= minRating);
};
