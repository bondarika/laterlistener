import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { authStore } from './stores/authStore';
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

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = observer(({ children }) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
});

const App = observer(() => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Dashboard />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transcript/:id"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Transcript />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/share/:id"
              element={
                <ProtectedRoute>
                  <Share />
                </ProtectedRoute>
              }
            />
            {/* Remove redirect to /login, now root is login */}
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
});

export default App;
