import React from 'react';
import CalendarPage from './pages/CalendarPage';
import './App.css';
import journalEntries from './data/journalEntries.json';

function App() {
  return (
    <div className="App">
      <CalendarPage journalDataSource={journalEntries} />
    </div>
  );
}

export default App;