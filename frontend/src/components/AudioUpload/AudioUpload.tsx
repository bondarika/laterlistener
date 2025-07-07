import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import { CloudUpload, AudioFile, PlayArrow } from '@mui/icons-material';
import { loadSettings } from '../../utils/settings';

interface SettingsType {
  language: string;
  model: string;
  quality: string;
  outputFormat: string;
}

const AudioUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [currentSettings, setCurrentSettings] = useState<SettingsType | null>(null);

  useEffect(() => {
    // Загружаем текущие настройки
    setCurrentSettings(loadSettings());
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем, что это аудиофайл
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Пожалуйста, выберите аудиофайл');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    // Имитация загрузки
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Здесь будет реальная логика загрузки на сервер
    // const formData = new FormData();
    // formData.append('audio', selectedFile);
    // await fetch('/api/upload', { method: 'POST', body: formData });
  };

  const handlePlayPreview = () => {
    if (selectedFile) {
      const audio = new Audio(URL.createObjectURL(selectedFile));
      audio.play();
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Загрузка аудиофайла
        </Typography>

        {currentSettings && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Текущие настройки:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Язык: ${currentSettings.language.toUpperCase()}`}
                size="small"
                variant="outlined"
              />
              <Chip label={`Модель: ${currentSettings.model}`} size="small" variant="outlined" />
              <Chip
                label={`Качество: ${currentSettings.quality}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Формат: ${currentSettings.outputFormat.toUpperCase()}`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <input
            accept="audio/*"
            style={{ display: 'none' }}
            id="audio-file-input"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="audio-file-input">
            <Button variant="outlined" component="span" startIcon={<CloudUpload />} sx={{ mb: 2 }}>
              Выбрать аудиофайл
            </Button>
          </label>
        </Box>

        {selectedFile && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AudioFile color="primary" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight="medium">
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
              <Button
                startIcon={<PlayArrow />}
                onClick={handlePlayPreview}
                variant="outlined"
                size="small"
              >
                Прослушать
              </Button>
            </Box>
          </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Загрузка... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          fullWidth
        >
          {uploading ? 'Загрузка...' : 'Отправить на транскрибуцию'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AudioUpload;
