import React, { useState, useEffect } from 'react';
import { Paper, Container, Box, Typography, IconButton, Slider } from '@mui/material';
import { PlayArrow, Pause, Download, Share, Close } from '@mui/icons-material';

interface AudioData {
  fileName: string;
  duration: number;
}

interface AudioPlayerProps {
  audioData: AudioData;
  onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<string>('');

  // Обновляем данные при изменении audioData
  useEffect(() => {
    if (audioData) {
      setDuration(audioData.duration);
      setCurrentFile(audioData.fileName);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [audioData]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    setCurrentTime(typeof newValue === 'number' ? newValue : newValue[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Скрываем плеер, если нет активного аудио
  if (!audioData || !currentFile) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        p: 2,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Кнопка воспроизведения/паузы */}
          <IconButton
            onClick={handlePlayPause}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'primary.main',
              color: 'white',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          {/* Информация о файле */}
          <Box sx={{ width: 200, flexShrink: 0 }}>
            <Typography variant="body2" noWrap>
              {currentFile}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
          </Box>

          {/* Прогресс-бар */}
          <Box sx={{ flexGrow: 1, mx: 2 }}>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              sx={{
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                },
              }}
            />
          </Box>

          {/* Дополнительные кнопки */}
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <IconButton size="small">
              <Download />
            </IconButton>
            <IconButton size="small">
              <Share />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default AudioPlayer;
