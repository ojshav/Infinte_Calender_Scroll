import type { JournalEntry } from '../types/journal';
import type { EntriesByDate } from '../types/calendar';
import { parseDDMMYYYYToISO } from './dateUtils';

/**
 * Raw journal entry format from JSON dataset
 */
interface RawJournalEntry {
  imgUrl: string;
  rating: number;
  categories: string[];
  date: string; // DD/MM/YYYY format
  description: string;
}

/**
 * Generate unique ID for journal entry
 */
const generateEntryId = (entry: RawJournalEntry, index: number): string => {
  // Create a simple hash-like ID based on date and index
  const dateHash = entry.date.replace(/\//g, '');
  return `entry_${dateHash}_${index}`;
};

/**
 * Transform raw entry to typed JournalEntry
 */
const transformRawEntry = (raw: RawJournalEntry, index: number): JournalEntry => {
  return {
    id: generateEntryId(raw, index),
    date: parseDDMMYYYYToISO(raw.date), // Convert DD/MM/YYYY to YYYY-MM-DD
    imgUrl: raw.imgUrl,
    rating: raw.rating,
    categories: raw.categories,
    description: raw.description
  };
};

/**
 * Load and parse journal entries from JSON data
 */
export const loadJournalEntries = async (jsonData: RawJournalEntry[]): Promise<JournalEntry[]> => {
  try {
    // Transform raw entries to typed entries
    const entries = jsonData.map((raw, index) => transformRawEntry(raw, index));
    
    // Sort entries by date (newest first)
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return entries;
  } catch (error) {
    console.error('Error loading journal entries:', error);
    return [];
  }
};

/**
 * Group journal entries by date for efficient calendar lookup
 */
export const groupEntriesByDate = (entries: JournalEntry[]): EntriesByDate => {
  const grouped: EntriesByDate = {};
  
  entries.forEach(entry => {
    const dateKey = entry.date; // Already in YYYY-MM-DD format
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(entry);
  });
  
  // Sort entries within each date by rating (highest first)
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => b.rating - a.rating);
  });
  
  return grouped;
};

/**
 * Load journal data from JSON file or API
 */
export const loadJournalData = async (dataSource: string | RawJournalEntry[]): Promise<EntriesByDate> => {
  try {
    let rawData: RawJournalEntry[];
    
    if (typeof dataSource === 'string') {
      // Load from URL/file path
      const response = await fetch(dataSource);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      rawData = await response.json();
    } else {
      // Use provided array directly
      rawData = dataSource;
    }
    
    const entries = await loadJournalEntries(rawData);
    return groupEntriesByDate(entries);
  } catch (error) {
    console.error('Error loading journal data:', error);
    return {};
  }
};

/**
 * Get entries for a specific date
 */
export const getEntriesForDate = (date: Date, entriesByDate: EntriesByDate): JournalEntry[] => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  
  return entriesByDate[dateKey] || [];
};

/**
 * Get all entries within a date range
 */
export const getEntriesInRange = (
  startDate: Date, 
  endDate: Date, 
  entriesByDate: EntriesByDate
): JournalEntry[] => {
  const entries: JournalEntry[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayEntries = getEntriesForDate(currentDate, entriesByDate);
    entries.push(...dayEntries);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Search entries by category
 */
export const getEntriesByCategory = (
  category: string, 
  entriesByDate: EntriesByDate
): JournalEntry[] => {
  const allEntries = Object.values(entriesByDate).flat();
  return allEntries.filter(entry => 
    entry.categories.some(cat => 
      cat.toLowerCase().includes(category.toLowerCase())
    )
  );
};

/**
 * Get entries with minimum rating
 */
export const getEntriesByMinRating = (
  minRating: number, 
  entriesByDate: EntriesByDate
): JournalEntry[] => {
  const allEntries = Object.values(entriesByDate).flat();
  return allEntries.filter(entry => entry.rating >= minRating);
};