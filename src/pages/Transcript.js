import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  ContentCopy,
  Download,
  Share,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

const Transcript = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadTranscription();
  }, [id]);

  const loadTranscription = async () => {
    try {
      setLoading(true);
      // Моковые данные
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTranscription({
        id: id,
        fileName: 'meeting_audio.mp3',
        duration: '15:30',
        language: 'ru',
        confidence: 0.95,
        text: 'Привет! Это пример транскрибуции аудиофайла.',
        timestamp: '2024-01-15 14:30:25',
        status: 'completed'
      });
    } catch (err) {
      setError('Ошибка загрузки транскрипции');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedText(transcription.text);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setTranscription(prev => ({
      ...prev,
      text: editedText
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription.text);
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

  const handleShare = () => {
    navigate(`/share/${id}`);
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
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
        >
          Вернуться к дашборду
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Назад к дашборду
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {transcription.fileName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={transcription.status === 'completed' ? 'Завершено' : 'В процессе'} 
                color={transcription.status === 'completed' ? 'success' : 'warning'}
              />
              <Chip 
                label={`${(transcription.confidence * 100).toFixed(1)}% точность`}
                color="primary"
              />
              <Chip 
                label={transcription.duration}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Текст транскрипции
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isEditing ? (
                <>
                  <Button
                    startIcon={<Save />}
                    onClick={handleSave}
                    variant="contained"
                    size="small"
                  >
                    Сохранить
                  </Button>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    variant="outlined"
                    size="small"
                  >
                    Отмена
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    variant="outlined"
                    size="small"
                  >
                    Редактировать
                  </Button>
                  <IconButton onClick={handleCopy} size="small">
                    <ContentCopy />
                  </IconButton>
                  <IconButton onClick={handleDownload} size="small">
                    <Download />
                  </IconButton>
                  <IconButton onClick={handleShare} size="small">
                    <Share />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={8}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              variant="outlined"
            />
          ) : (
            <Paper sx={{ p: 3, backgroundColor: '#fafafa', minHeight: 200 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {transcription.text}
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Transcript; 