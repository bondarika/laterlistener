import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import {
  ContentCopy,
  Download,
  Edit,
  Save,
  Cancel,
  PlayArrow,
  Pause
} from '@mui/icons-material';

const TranscriptionDisplay = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Пример данных транскрибуции
  const transcriptionData = {
    id: '1',
    fileName: 'audio_sample.mp3',
    duration: '2:34',
    language: 'ru',
    confidence: 0.95,
    text: 'Привет! Это пример транскрибуции аудиофайла. Здесь будет отображаться текст, полученный из аудио.',
    timestamp: '2024-01-15 14:30:25',
    status: 'completed'
  };

  const handleEdit = () => {
    setEditedText(transcriptionData.text);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Здесь будет логика сохранения изменений
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcriptionData.text);
  };

  const handleDownload = () => {
    const blob = new Blob([transcriptionData.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transcriptionData.fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Здесь будет логика воспроизведения аудио
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Результат транскрибуции
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={transcriptionData.status === 'completed' ? 'Завершено' : 'В процессе'} 
              color={transcriptionData.status === 'completed' ? 'success' : 'warning'}
              size="small"
            />
            <Chip 
              label={`${(transcriptionData.confidence * 100).toFixed(1)}% точность`}
              color="primary"
              size="small"
            />
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {transcriptionData.fileName} • {transcriptionData.duration} • {transcriptionData.language.toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {transcriptionData.timestamp}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mb: 2 }}>
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              variant="outlined"
              sx={{ mb: 1 }}
            />
          ) : (
            <Paper sx={{ p: 2, backgroundColor: '#fafafa', minHeight: 100 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {transcriptionData.text}
              </Typography>
            </Paper>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
              <Button
                startIcon={<ContentCopy />}
                onClick={handleCopy}
                variant="outlined"
                size="small"
              >
                Копировать
              </Button>
              <Button
                startIcon={<Download />}
                onClick={handleDownload}
                variant="outlined"
                size="small"
              >
                Скачать
              </Button>
              <IconButton
                onClick={handlePlayPause}
                color="primary"
                size="small"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TranscriptionDisplay; 