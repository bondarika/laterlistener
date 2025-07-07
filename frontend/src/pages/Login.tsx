import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Alert, CircularProgress, Button } from '@mui/material';
import { Telegram, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

type Status = 'waiting' | 'loading' | 'success' | 'error';

const Login: React.FC = () => {
  const [status, setStatus] = useState<Status>('waiting');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, авторизован ли пользователь через Telegram
    // checkTelegramAuth();

    // Временно пропускаем авторизацию для тестирования
    setStatus('waiting');
  }, []);

  const checkTelegramAuth = async () => {
    try {
      setStatus('loading');

      // Здесь будет проверка авторизации через Telegram
      // Например, проверка токена в localStorage или запрос к API
      const telegramAuth = localStorage.getItem('telegram_auth');

      if (telegramAuth) {
        // Пользователь уже авторизован
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatus('waiting');
      }
    } catch {
      setStatus('error');
      setError(
        '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u0438',
      );
    }
  };

  const handleTelegramLogin = () => {
    // Инициируем авторизацию через Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      // Используем Telegram Web App API
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      // Получаем данные пользователя
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        // Сохраняем данные авторизации
        localStorage.setItem('telegram_auth', JSON.stringify(user));
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } else {
      // Fallback для обычного браузера
      // Здесь можно открыть Telegram или показать QR-код
      window.open('https://t.me/your_bot_username', '_blank');
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
            <Button variant="contained" onClick={checkTelegramAuth} size="large">
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

            {/* Временная кнопка для тестирования */}
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              🚀 Перейти к дашборду (тест)
            </Button>
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
};

export default Login;
