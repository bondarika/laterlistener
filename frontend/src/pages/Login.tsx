import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Alert, CircularProgress, Button } from '@mui/material';
import { Telegram, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';
import WebApp from '@twa-dev/sdk';

type Status = 'waiting' | 'loading' | 'success' | 'error';

const Login: React.FC = observer(() => {
  const params = new URLSearchParams(WebApp.initData);
  const userData = JSON.parse(params.get('user') || 'null');
  const [status, setStatus] = useState<Status>('waiting');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setStatus('loading');
      await authStore.checkAuth();

      if (authStore.isAuthenticated) {
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatus('waiting');
      }
    } catch (error) {
      setStatus('waiting');
      console.error('Auth check failed:', error);
    }
  };

  const handleTelegramLogin = async () => {
    try {
      setStatus('loading');
      setError('');

      // Check if we're in Telegram Web App
      if (WebApp) {
        // Use Telegram Web App API
        WebApp.ready();
        WebApp.expand();

        if (userData) {
          // Login with Telegram user data
          await authStore.login({
            id: userData.id,
            telegram_id: userData.id,
            created_at: new Date().toISOString(),
          });

          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          throw new Error('Не удалось получить данные пользователя из Telegram');
        }
      } else {
        // Fallback for regular browser - redirect to Telegram
        window.open('https://t.me/your_bot_username', '_blank');
        setError('Откройте приложение в Telegram для авторизации');
      }
    } catch (error) {
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Ошибка авторизации');
      console.error('Login error:', error);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Проверка авторизации...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Подождите, мы проверяем ваш аккаунт
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Авторизация успешна!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Перенаправляем на главную страницу...
            </Typography>
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={checkAuth} size="large">
              Попробовать снова
            </Button>
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Telegram sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Добро пожаловать!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Для доступа к транскрибуции аудио необходимо авторизоваться через Telegram
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<Telegram />}
              onClick={handleTelegramLogin}
              sx={{ mb: 2 }}
            >
              Войти через Telegram
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Авторизация происходит автоматически в Telegram
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {renderContent()}
      </Paper>
    </Container>
  );
});

export default Login;
