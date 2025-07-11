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
import { observer } from 'mobx-react-lite';
import { transcriptStore } from '../stores/transcriptStore';

const Share: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  const loadTranscription = useCallback(async () => {
    if (!id) return;

    try {
      await transcriptStore.loadById(id);
      setShareUrl(`${window.location.origin}/share/${id}`);
    } catch (error) {
      console.error('Failed to load transcript:', error);
    }
  }, [id]);

  useEffect(() => {
    loadTranscription();
  }, [id, loadTranscription]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowSnackbar(true);
  };

  const handleDownload = async () => {
    if (!transcriptStore.transcript) return;

    try {
      const blob = await transcriptStore.downloadTranscriptFile('txt');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${transcriptStore.transcript.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (transcriptStore.loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (transcriptStore.error || !transcriptStore.transcript) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {transcriptStore.error || 'Транскрипция не найдена'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Вернуться к дашборду
        </Button>
      </Container>
    );
  }

  const transcript = transcriptStore.transcript;

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
              Транскрипция #{transcript.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Создано: {formatDate(transcript.created_at)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Обновлено: {formatDate(transcript.updated_at)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label="Завершено" color="success" size="small" />
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
});

export default Share;
