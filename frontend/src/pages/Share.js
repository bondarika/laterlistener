import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy,
  Download
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

const Share = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    loadTranscription();
  }, [id]);

  const loadTranscription = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTranscription({
        id: id,
        fileName: 'meeting_audio.mp3',
        duration: '15:30',
        text: 'Привет! Это пример транскрибуции аудиофайла.',
        timestamp: '2024-01-15 14:30:25',
        status: 'completed'
      });

      setShareUrl(`${window.location.origin}/share/${id}`);
    } catch (err) {
      setError('Ошибка загрузки транскрипции');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowSnackbar(true);
  };

  const handleDownload = () => {
    const blob = new Blob([transcription.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transcription.fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !transcription) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Транскрипция не найдена'}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
        >
          Вернуться к дашборду
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Поделиться транскрипцией
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Настройте параметры доступа и поделитесь ссылкой
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Информация о файле
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium">
              {transcription.fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Длительность: {transcription.duration}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Создано: {transcription.timestamp}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={transcription.status === 'completed' ? 'Завершено' : 'В процессе'} 
              color={transcription.status === 'completed' ? 'success' : 'warning'}
              size="small"
            />
          </Box>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
            fullWidth
          >
            Скачать оригинал
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ссылка для доступа
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              value={shareUrl}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton onClick={handleCopyUrl} color="primary">
              <ContentCopy />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleCopyUrl}
          >
            Копировать ссылку
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message="Ссылка скопирована в буфер обмена"
      />
    </Container>
  );
};

export default Share;