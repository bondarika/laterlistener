import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Mic, Headphones, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../stores/authStore';

const Header: React.FC = observer(() => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authStore.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Mic sx={{ fontSize: 32 }} />
          <Headphones sx={{ fontSize: 32 }} />
        </Box>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            ml: 2,
            fontWeight: 'bold',
            flexGrow: 1,
          }}
        >
          LaterListener
        </Typography>

        {authStore.isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" startIcon={<Logout />} onClick={handleLogout} size="small">
              Выйти
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Telegram Bot Interface
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
});

export default Header;
