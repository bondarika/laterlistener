import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Mic, Headphones } from '@mui/icons-material';

const Header: React.FC = () => {
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
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Telegram Bot Interface
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
