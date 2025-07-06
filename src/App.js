import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Header from './components/Header/Header';
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <>
                <Header />
                <Dashboard />
              </>
            } />
            <Route path="/transcript/:id" element={
              <>
                <Header />
                <Transcript />
              </>
            } />
            <Route path="/share/:id" element={<Share />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
