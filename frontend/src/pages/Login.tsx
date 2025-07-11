import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Alert, CircularProgress, Button } from '@mui/material';
import { Telegram, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';

type Status = 'waiting' | 'loading' | 'success' | 'error';

const Login: React.FC = observer(() => {
  const [status, setStatus] = useState<Status>('waiting');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const [loginByToken, setLoginByToken] = useState<boolean>(false);

  useEffect(() => {
    // Проверяем наличие одноразового токена в URL
    const params = new URLSearchParams(window.location.search);
    const oneTimeToken = params.get('auth_token') || params.get('token');
    if (oneTimeToken) {
      setStatus('loading');
      authStore
        .exchangeOneTimeTokenForJWT(oneTimeToken)
        .then((success) => {
          if (success) {
            setLoginByToken(true);
            // Убираем токен из URL
            params.delete('auth_token');
            window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          } else {
            setStatus('error');
            setError(
              'Срок действия ссылки истёк. Пожалуйста, получите новую ссылку через Telegram-бота.',
            );
          }
        })
        .catch(() => {
          setStatus('error');
          setError(
            'Срок действия ссылки истёк. Пожалуйста, получите новую ссылку через Telegram-бота.',
          );
        });
    }
  }, []);

  // useEffect(() => {
  //   // checkAuth();
  // }, []);

  // const checkAuth = async () => {
  //   try {
  //     setStatus('loading');
  //     await authStore.checkAuth();

  //     if (authStore.isAuthenticated) {
  //       setStatus('success');
  //       setTimeout(() => {
  //         navigate('/dashboard');
  //       }, 1500);
  //     } else {
  //       setStatus('waiting');
  //     }
  //   } catch (error) {
  //     setStatus('waiting');
  //     console.error('Auth check failed:', error);
  //   }
  // };

  const handleTelegramLogin = async () => {
    // Замените на ваш username бота
    window.location.href = 'https://t.me/laterlistener_bot';
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
            <Alert
              severity="error"
              sx={{
                mb: 3,
                py: 2,
                px: 2,
                borderRadius: 2,
                boxShadow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontSize: 16,
                backgroundColor: '#fff0f0',
              }}
              iconMapping={{
                error: <CheckCircle sx={{ fontSize: 36, color: 'error.main', mb: 1 }} />,
              }}
            >
              <Typography
                variant="h6"
                component="div"
                color="error"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Ошибка авторизации
              </Typography>
              <Typography variant="body2" color="error" sx={{ fontSize: 16, fontWeight: 400 }}>
                {error}
              </Typography>
            </Alert>
            <Button variant="contained" onClick={handleTelegramLogin} size="large">
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
              Для доступа к транскрибуции аудио необходимо авторизоваться через Telegram-бота
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

  if (loginByToken) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Успешный вход! Теперь вы можете пользоваться сервисом.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Перенаправляем на главную страницу...
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {renderContent()}
      </Paper>
    </Container>
  );
});

export default Login;
