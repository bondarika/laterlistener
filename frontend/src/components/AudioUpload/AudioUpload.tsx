import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import { CloudUpload, AudioFile } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { transcriptStore } from '../../stores/transcriptStore';

interface AudioUploadProps {
  onUploadComplete?: () => void;
}

const AudioUpload: React.FC<AudioUploadProps> = observer(({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an audio file
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
    setError('');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Step 1: Upload file to get URL
      const uploadResponse = await transcriptStore.uploadAudioFile(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Step 2: Start transcribe with the file URL
      await transcriptStore.transcribeAudio(uploadResponse.file_url, selectedFile.name);

      // Wait a bit to show completion
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
        setUploadProgress(0);

        // Call callback if provided
        if (onUploadComplete) {
          onUploadComplete();
        }
      }, 500);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      setError('Ошибка загрузки файла. Попробуйте еще раз.');
      console.error('Upload error:', error);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Загрузка аудиофайла
        </Typography>

        <Box sx={{ mb: 2 }}>
          <input
            accept="audio/*"
            style={{ display: 'none' }}
            id="audio-file-input"
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="audio-file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
              disabled={uploading}
            >
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

        {transcriptStore.transcribeStatus === 'processing' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Транскрибация... {transcriptStore.transcribeProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={transcriptStore.transcribeProgress} />
          </Box>
        )}

        {transcriptStore.transcribeStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {transcriptStore.error || 'Ошибка транскрибации'}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading || transcriptStore.transcribeStatus === 'processing'}
          fullWidth
        >
          {uploading
            ? 'Загрузка...'
            : transcriptStore.transcribeStatus === 'processing'
              ? 'Транскрибация...'
              : 'Отправить на транскрибуцию'}
        </Button>
      </CardContent>
    </Card>
  );
});

export default AudioUpload;
