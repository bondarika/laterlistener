import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fab
} from '@mui/material';
import {
  Add,
  History,
  TrendingUp,
  Storage,
  PlayArrow,
  Download,
  Share,
  Settings as SettingsIcon,
  Summarize
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AudioUpload from '../components/AudioUpload/AudioUpload';
import Settings from '../components/Settings/Settings';

const Dashboard = ({ onPlayAudio }) => {
  const [recentTranscriptions, setRecentTranscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalDuration: 0,
    accuracy: 0
  });
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Загружаем данные при монтировании компонента
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Здесь будет загрузка данных с сервера
    // Пока используем моковые данные
    setRecentTranscriptions([
      {
        id: '1',
        fileName: 'meeting_audio.mp3',
        duration: '15:30',
        status: 'completed',
        accuracy: 0.95,
        timestamp: '2024-01-15 14:30:25'
      },
      {
        id: '2',
        fileName: 'interview.wav',
        duration: '8:45',
        status: 'processing',
        accuracy: null,
        timestamp: '2024-01-15 13:15:10'
      },
      {
        id: '3',
        fileName: 'lecture.m4a',
        duration: '45:20',
        status: 'completed',
        accuracy: 0.92,
        timestamp: '2024-01-14 16:45:30'
      }
    ]);

    setStats({
      totalFiles: 15,
      totalDuration: 180, // в минутах
      accuracy: 0.94
    });
  };

  const handleNewTranscription = () => {
    setShowUpload(true);
  };

  const handleViewTranscription = (id) => {
    navigate(`/transcript/${id}`);
  };

  const handlePlayAudio = (item) => {
    // Конвертируем время из формата "15:30" в секунды
    const timeParts = item.duration.split(':');
    const durationInSeconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    
    onPlayAudio({
      fileName: item.fileName,
      duration: durationInSeconds,
      id: item.id
    });
  };

  const handleShareTranscription = (id) => {
    navigate(`/share/${id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'processing':
        return 'Обработка';
      case 'error':
        return 'Ошибка';
      default:
        return 'Неизвестно';
    }
  };

  if (showUpload) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setShowUpload(false)}
            sx={{ mb: 2 }}
          >
            ← Назад к дашборду
          </Button>
        </Box>
        <AudioUpload />
      </Container>
    );
  }

  if (showSettings) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setShowSettings(false)}
            sx={{ mb: 2 }}
          >
            ← Назад к дашборду
          </Button>
        </Box>
        <Settings />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель управления
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управляйте своими аудиофайлами и транскрипциями
        </Typography>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Storage sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalFiles}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего файлов
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {Math.round(stats.totalDuration)} мин
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Общая длительность
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <History sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {Math.round(stats.accuracy * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Средняя точность
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Последние транскрипции */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Последние транскрипции
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleNewTranscription}
            >
              Новая транскрипция
            </Button>
          </Box>
          
          <List>
            {recentTranscriptions.map((item) => (
              <ListItem 
                key={item.id} 
                divider
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={getStatusText(item.status)}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => handlePlayAudio(item)}
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleShareTranscription(item.id)}
                    >
                      <Share />
                    </IconButton>
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => handleViewTranscription(item.id)}
                    >
                      {item.fileName}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.duration} • {item.timestamp}
                      </Typography>
                      {item.accuracy && (
                        <Typography variant="body2" color="text.secondary">
                          Точность: {Math.round(item.accuracy * 100)}%
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Быстрые действия */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={handleNewTranscription}
            sx={{ py: 2 }}
          >
            Создать новую транскрипцию
          </Button>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<History />}
            onClick={() => navigate('/history')}
            sx={{ py: 2 }}
          >
            История транскрипций
          </Button>
        </Grid>
      </Grid>

      {/* Плавающая кнопка для настроек */}
      <Fab
        color="primary"
        aria-label="settings"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowSettings(true)}
      >
        <SettingsIcon />
      </Fab>
    </Container>
  );
};

export default Dashboard; 