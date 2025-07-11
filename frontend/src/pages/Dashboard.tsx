import React, { useState, useEffect } from 'react';
import {
  Container,
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, History, TrendingUp, Storage, Download, Share } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { transcriptStore } from '../stores/transcriptStore';
import { authStore } from '../stores/authStore';
import AudioUpload from '../components/AudioUpload/AudioUpload';

const Dashboard: React.FC = observer(() => {
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем наличие одноразового токена в URL
    const params = new URLSearchParams(window.location.search);
    const oneTimeToken = params.get('auth_token');
    if (oneTimeToken) {
      authStore.exchangeOneTimeTokenForJWT(oneTimeToken).then((success) => {
        if (success) {
          setLoginSuccess(true);
          // Убираем токен из URL
          params.delete('auth_token');
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Load transcripts when component mounts
    transcriptStore.loadAll();
  }, []);

  const handleNewTranscription = () => {
    setShowUpload(true);
  };

  const handleViewTranscription = (id: string) => {
    navigate(`/transcript/${id}`);
  };

  const handleShareTranscription = (id: string) => {
    navigate(`/share/${id}`);
  };

  const handleDownload = async (id: string) => {
    try {
      const blob = await transcriptStore.downloadTranscriptFile('txt');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  // Calculate stats from real data
  const stats = {
    totalFiles: transcriptStore.transcripts.length,
    totalDuration: transcriptStore.transcripts.length * 5, // Mock duration calculation
  };

  if (loginSuccess) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Успешный вход! Теперь вы можете пользоваться сервисом.
        </Alert>
        <Button variant="outlined" onClick={() => (window.location.href = '/dashboard')}>
          Перейти к дашборду
        </Button>
      </Container>
    );
  }

  if (showUpload) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={() => setShowUpload(false)} sx={{ mb: 2 }}>
            ← Назад к дашборду
          </Button>
        </Box>
        <AudioUpload
          onUploadComplete={() => {
            setShowUpload(false);
            transcriptStore.loadAll(); // Reload transcripts after upload
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель управления
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управляйте своими аудиофайлами и транскрипциями
        </Typography>
      </Box>

      {/* Error display */}
      {transcriptStore.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {transcriptStore.error}
        </Alert>
      )}

      {/* Statistics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
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
      </Box>

      {/* Recent transcriptions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">Последние транскрипции</Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={handleNewTranscription}>
              Новая транскрипция
            </Button>
          </Box>

          {transcriptStore.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : transcriptStore.transcripts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                У вас пока нет транскрипций. Создайте первую!
              </Typography>
            </Box>
          ) : (
            <List>
              {transcriptStore.transcripts.map((transcript) => (
                <ListItem
                  key={transcript.id}
                  divider
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Завершено" color="success" size="small" />
                      <IconButton
                        size="small"
                        onClick={() => handleShareTranscription(transcript.id)}
                      >
                        <Share />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDownload(transcript.id)}>
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
                          '&:hover': { color: 'primary.main' },
                        }}
                        onClick={() => handleViewTranscription(transcript.id)}
                      >
                        Транскрипция #{transcript.id}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Создано: {formatDate(transcript.created_at)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Обновлено: {formatDate(transcript.updated_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}
      >
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

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<History />}
          onClick={() => navigate('/dashboard')}
          sx={{ py: 2 }}
        >
          История транскрипций
        </Button>
      </Box>
    </Container>
  );
});

export default Dashboard;
