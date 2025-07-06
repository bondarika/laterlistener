import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Header from './components/Header/Header';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transcript from './pages/Transcript';
import Share from './pages/Share';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentTab, setCurrentTab] = useState('transcript');

  const handlePlayAudio = (audioData) => {
    setCurrentAudio(audioData);
  };

  const handleCloseAudio = () => {
    setCurrentAudio(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', pb: currentAudio ? 10 : 0 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <>
                <Header />
                <Dashboard onPlayAudio={handlePlayAudio} />
              </>
            } />
            <Route path="/transcript/:id" element={
              <>
                <Header />
                <Transcript 
                  onPlayAudio={handlePlayAudio} 
                  currentTab={currentTab}
                  onTabChange={setCurrentTab}
                />
              </>
            } />
            <Route path="/share/:id" element={<Share />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <AudioPlayer 
            audioData={currentAudio} 
            onClose={handleCloseAudio} 
          />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
