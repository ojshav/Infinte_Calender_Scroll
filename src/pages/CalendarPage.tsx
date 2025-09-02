import React, { useState, useEffect, useCallback, useMemo } from 'react';

import type { EntriesByDate } from '../types/calendar';
import type { JournalEntry } from '../types/journal';
import Header from '../components/Header';
import CalendarGrid from '../components/CalendarGrid';
import JournalModal from '../components/JournalModal';

import { formatMonthYear } from '../utils/dateUtils';
import { loadJournalData } from '../utils/datasetLoader';

interface CalendarPageProps {
  journalDataSource?: string | any[]; // URL or direct data array
}

const CalendarPage: React.FC<CalendarPageProps> = ({ 
  journalDataSource = [] 
}) => {
  // State management
  const [entriesByDate, setEntriesByDate] = useState<EntriesByDate>({});
  const [currentVisibleMonth, setCurrentVisibleMonth] = useState<{ year: number; month: number } | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [jumpToYearFunction, setJumpToYearFunction] = useState<((year: number, month?: number) => void) | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);

  // Get current month and year dynamically
  const now = new Date();
  const initialYear = now.getFullYear();
  const initialMonth = now.getMonth(); // Current month (0-based)

  // Load journal data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const data = await loadJournalData(journalDataSource);
        setEntriesByDate(data);
      } catch (error) {
        console.error('Failed to load journal data:', error);
        setEntriesByDate({});
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [journalDataSource]);

  // Set initial visible month
  useEffect(() => {
    if (!currentVisibleMonth) {
      console.log(`CalendarPage: Setting initial visible month to ${initialYear}-${initialMonth} (${formatMonthYear(initialYear, initialMonth)})`);
      setCurrentVisibleMonth({ year: initialYear, month: initialMonth });
    }
  }, [initialYear, initialMonth, currentVisibleMonth]);

  // Handle day cell click
  const handleDayClick = useCallback((entries: JournalEntry[]) => {
    if (entries.length > 0) {
      // Get ALL journal entries from the entire dataset and sort chronologically
      const allEntries = Object.values(entriesByDate).flat();
      
      // Sort entries by date (oldest to newest)
      const sortedEntries = allEntries.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Find the index of the clicked day's first entry in the sorted array
      const clickedDayFirstEntry = entries[0];
      const startIndex = sortedEntries.findIndex(entry => entry.id === clickedDayFirstEntry.id);
      
      setSelectedEntries(sortedEntries);
      setCurrentEntryIndex(startIndex >= 0 ? startIndex : 0);
      setIsModalOpen(true);
    }
  }, [entriesByDate]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEntries([]);
    setCurrentEntryIndex(0);
  }, []);

  // Handle modal navigation
  const handleModalNavigate = useCallback((newIndex: number) => {
    setCurrentEntryIndex(newIndex);
  }, []);

  // Update current visible month from CalendarGrid
  const handleVisibleMonthChange = useCallback((year: number, month: number) => {
    console.log(`CalendarPage: Visible month changed to ${year}-${month} (${formatMonthYear(year, month)})`);
    setCurrentVisibleMonth({ year, month });
  }, []);

  // Handle jump to year from Header
  const handleJumpToYear = useCallback((year: number, month?: number) => {
    if (jumpToYearFunction) {
      jumpToYearFunction(year, month);
    }
  }, [jumpToYearFunction]);

  // Handle setting jump to year function from CalendarGrid
  const handleSetJumpToYearFunction = useCallback((jumpFunction: (year: number, month?: number) => void) => {
    setJumpToYearFunction(() => jumpFunction);
  }, []);

  // Format current month for header
  const currentMonthDisplay = useMemo(() => {
    return currentVisibleMonth 
      ? formatMonthYear(currentVisibleMonth.year, currentVisibleMonth.month)
      : formatMonthYear(initialYear, initialMonth);
  }, [currentVisibleMonth, initialYear, initialMonth]);

  // Show loading state while data loads
  if (isDataLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header currentMonth={currentMonthDisplay} onJumpToYear={handleJumpToYear} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading journal entries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with current month */}
      <Header currentMonth={currentMonthDisplay} onJumpToYear={handleJumpToYear} />
      
      {/* Main calendar grid */}
      <CalendarGrid
        initialYear={initialYear}
        initialMonth={initialMonth}
        entriesByDate={entriesByDate}
        onVisibleMonthChange={handleVisibleMonthChange}
        onDayClick={handleDayClick}
        onJumpToYear={handleSetJumpToYearFunction}
      />
      
      {/* Journal Modal */}
      {isModalOpen && selectedEntries.length > 0 && (
        <JournalModal
          entries={selectedEntries}
          currentIndex={currentEntryIndex}
          onClose={handleModalClose}
          onNavigate={handleModalNavigate}
        />
      )}
    </div>
  );
};

export default CalendarPage;
