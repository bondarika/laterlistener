import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Tabs,
  Tab,
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
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

interface TranscriptProps {
  onPlayAudio: (audio: { fileName: string; duration: number; id: string }) => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

interface Transcription {
  id: string;
  fileName: string;
  duration: string;
  language: string;
  confidence: number;
  text: string;
  timestamp: string;
  status: string;
}

const Transcript: React.FC<TranscriptProps> = ({ onPlayAudio, currentTab, onTabChange }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);

  const loadTranscription = useCallback(async () => {
    try {
      setLoading(true);
      // Моковые данные
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTranscription({
        id: id,
        fileName: 'meeting_audio.mp3',
        duration: '15:30',
        language: 'ru',
        confidence: 0.95,
        text: 'Привет! Это пример транскрибуции аудиофайла.',
        timestamp: '2024-01-15 14:30:25',
        status: 'completed',
      });
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

  const handleEdit = () => {
    setEditedText(transcription.text);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setTranscription((prev) => ({
      ...prev,
      text: editedText,
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText('');
  };

  const handleCopy = () => {
    const textToCopy = currentTab === 'transcript' ? transcription.text : summary;
    navigator.clipboard.writeText(textToCopy);
  };

  const handleDownload = () => {
    const textToDownload = currentTab === 'transcript' ? transcription.text : summary;
    const fileName =
      currentTab === 'transcript'
        ? `${transcription.fileName}.txt`
        : `${transcription.fileName}_summary.txt`;

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    navigate(`/share/${id}`);
  };

  const handlePlayAudio = () => {
    // Конвертируем время из формата "15:30" в секунды
    const timeParts = transcription.duration.split(':');
    const durationInSeconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);

    onPlayAudio({
      fileName: transcription.fileName,
      duration: durationInSeconds,
      id: transcription.id,
    });
  };

  const handleTabChange = (event, newValue) => {
    onTabChange(newValue);
  };

  const generateSummary = useCallback(async () => {
    if (summary) return; // Если саммари уже есть, не генерируем повторно

    setSummaryLoading(true);
    try {
      // Имитация генерации саммари
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSummary(
        'Это краткое содержание транскрипции. Основные темы обсуждения включают планирование проекта, распределение задач и установление сроков. Участники встречи договорились о следующих шагах и назначили ответственных за выполнение ключевых задач.',
      );
    } catch (error) {
      console.error('Ошибка генерации саммари:', error);
    } finally {
      setSummaryLoading(false);
    }
  }, [summary]);

  // Генерируем саммари при загрузке страницы
  useEffect(() => {
    if (!summary && !summaryLoading) {
      generateSummary();
    }
  }, [summary, summaryLoading, generateSummary]);

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
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
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
              <Chip label={transcription.duration} variant="outlined" />
            </Box>
          </Box>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* Вкладки */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="Транскрипция" value="transcript" />
              <Tab label="Саммари" value="summary" />
            </Tabs>
          </Box>

          {/* Заголовок и кнопки действий */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">
              {currentTab === 'transcript' ? 'Текст транскрипции' : 'Краткое содержание'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentTab === 'transcript' &&
                (isEditing ? (
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
                    <IconButton onClick={handlePlayAudio} size="small">
                      <PlayArrow />
                    </IconButton>
                    <IconButton onClick={handleDownload} size="small">
                      <Download />
                    </IconButton>
                    <IconButton onClick={handleShare} size="small">
                      <Share />
                    </IconButton>
                  </>
                ))}
              {currentTab === 'summary' && (
                <>
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

          {/* Контент вкладок */}
          {currentTab === 'transcript' &&
            (isEditing ? (
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
            ))}

          {currentTab === 'summary' && (
            <Paper sx={{ p: 3, backgroundColor: '#fafafa', minHeight: 200 }}>
              {summaryLoading ? (
                <Box
                  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}
                >
                  <CircularProgress size={40} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Генерируем саммари...
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {summary}
                </Typography>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Transcript;
