import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/Homepage';
import CompromiseGenerator from './components/CompromiseGenerator';
import ChoreSplitter from './components/ChoreSplitter';
import Dashboard from './components/Dashboard';
import TherapistChatbot from './components/TherapistChatbot';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const [choreList, setChoreList] = useState(null);
  const [choreLoading, setChoreLoading] = useState(false);
  const [choreError, setChoreError] = useState(null);
  const [choresHistory, setChoresHistory] = useState([]);
  const [compromiseHistory, setCompromiseHistory] = useState([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedChores = localStorage.getItem('choresHistory');
    const savedCompromises = localStorage.getItem('compromiseHistory');
    
    console.log('[App.js] Loading from localStorage...');
    if (savedChores) {
      const parsed = JSON.parse(savedChores);
      console.log('[App.js] Loaded choresHistory:', parsed);
      setChoresHistory(parsed);
    }
    if (savedCompromises) {
      const parsed = JSON.parse(savedCompromises);
      console.log('[App.js] Loaded compromiseHistory:', parsed);
      setCompromiseHistory(parsed);
    }
  }, []);

  // Save choresHistory to localStorage whenever it changes
  useEffect(() => {
    console.log('[App.js] Saving choresHistory to localStorage:', choresHistory);
    localStorage.setItem('choresHistory', JSON.stringify(choresHistory));
  }, [choresHistory]);

  // Save compromiseHistory to localStorage whenever it changes
  useEffect(() => {
    console.log('[App.js] Saving compromiseHistory to localStorage:', compromiseHistory);
    localStorage.setItem('compromiseHistory', JSON.stringify(compromiseHistory));
  }, [compromiseHistory]);

  const splitChores = async (familyMembers, choreItems) => {
    setChoreLoading(true);
    setChoreError(null);
    setChoreList(null);
    try {
      const response = await fetch('http://localhost:3001/api/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyMembers: familyMembers,
          choreItems: choreItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Backend request failed');
      }

      const parsed = await response.json();
      setChoreList(parsed);
      // Callback to create history will be called from ChoreSplitter component
      return parsed;
    } catch (err) {
      console.error('Error:', err);
      setChoreError('Backend connection failed. Make sure your server is running on port 3001.');
    } finally {
      setChoreLoading(false);
    }
  };

  const handleCompromiseGenerated = (topic, people, result) => {
    console.log('[App.js] handleCompromiseGenerated called with topic:', topic, 'people:', people, 'result:', result);
    const firstPerson = people && people.length > 0 ? people[0].name : 'Someone';
    const newEntry = {
      topic: topic,
      members: people.map(p => p.name || `Person ${people.indexOf(p) + 1}`),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Compromise',
      instigator: firstPerson,
      result: result?.compromiseName || 'Compromise Generated',
    };
    console.log('[App.js] Adding entry to compromiseHistory:', newEntry);
    setCompromiseHistory(prev => {
      const updated = [...prev, newEntry];
      console.log('[App.js] Updated compromiseHistory:', updated);
      return updated;
    });
  };

  const handleChoreHistoryCreated = (members, chores, result) => {
    console.log('[App.js] handleChoreHistoryCreated called with members:', members, 'chores:', chores);
    const firstMember = members && members.length > 0 ? members[0].name : 'Someone';
    const newEntry = {
      topic: 'Chore Distribution',
      members: members.map(m => m.name),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Chores',
      instigator: firstMember,
      chores: chores,
      result: result,
    };
    console.log('[App.js] Adding entry to choresHistory:', newEntry);
    setChoresHistory(prev => {
      const updated = [...prev, newEntry];
      console.log('[App.js] Updated choresHistory:', updated);
      return updated;
    });
  };

  const handleResetHistory = () => {
    setChoresHistory([]);
    setCompromiseHistory([]);
    setChoreList(null);
    setChoreError(null);
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/compromise-generator"
        element={
          <CompromiseGenerator
            goBack={() => navigate('/')}
            onCompromiseGenerated={handleCompromiseGenerated}
          />
        }
      />
      <Route
        path="/chore-splitter"
        element={
          <ChoreSplitter
            onSplit={splitChores}
            onChoreHistoryCreated={handleChoreHistoryCreated}
            choreList={choreList}
            loading={choreLoading}
            error={choreError}
            goBack={() => navigate('/')}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <Dashboard
            choresHistory={choresHistory}
            compromiseHistory={compromiseHistory}
            onReset={handleResetHistory}
            goBack={() => navigate(-1)}
          />
        }
      />
      <Route
        path="/therapist-chatbot"
        element={
          <TherapistChatbot
            goBack={() => navigate('/')}
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;