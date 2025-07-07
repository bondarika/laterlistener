import React, { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
} from '@mui/material';
import { Share as ShareIcon, ContentCopy, Download } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

interface Transcription {
  id: string;
  fileName: string;
  duration: string;
  text: string;
  timestamp: string;
  status: string;
}

const Share: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  const loadTranscription = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTranscription({
        id: id,
        fileName: 'meeting_audio.mp3',
        duration: '15:30',
        text: '\u041f\u0440\u0438\u0432\u0435\u0442! \u042d\u0442\u043e \u043f\u0440\u0438\u043c\u0435\u0440 \u0442\u0440\u0430\u043d\u0441\u043a\u0440\u0438\u0431\u0443\u0446\u0438\u0438 \u0430\u0443\u0434\u0438\u043e\u0444\u0430\u0439\u043b\u0430.',
        timestamp: '2024-01-15 14:30:25',
        status: 'completed',
      });

      setShareUrl(`${window.location.origin}/share/${id}`);
    } catch {
      setError(
        '\u041e\u0448\u0438\u0431\u043a\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0442\u0440\u0430\u043d\u0441\u043a\u0440\u0438\u043f\u0446\u0438\u0438',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTranscription();
  }, [id, loadTranscription]);

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
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
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

          <Button variant="outlined" startIcon={<Download />} onClick={handleDownload} fullWidth>
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

          <Button variant="contained" startIcon={<ShareIcon />} onClick={handleCopyUrl}>
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
