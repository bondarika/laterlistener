import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Box,
  Divider,
  Button,
  TextField,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { Settings as SettingsIcon, Save, Restore } from '@mui/icons-material';
import { loadSettings, saveSettings, resetSettings, defaultSettings } from '../../utils/settings';

const Settings = () => {
  const [settings, setSettings] = useState(() => {
    // Загружаем сохраненные настройки из localStorage при инициализации
    return loadSettings();
  });

  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaveStatus('saving');
      
      // Сохраняем настройки используя утилиту
      const success = saveSettings(settings);
      
      if (!success) {
        throw new Error('Ошибка сохранения в localStorage');
      }
      
      // Имитация отправки на сервер (можно заменить на реальный API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      setSaveStatus('error');
      
      // Скрываем сообщение об ошибке через 5 секунд
      setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    }
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    resetSettings();
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Настройки транскрибуции
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Язык</InputLabel>
                <Select
                  value={settings.language}
                  label="Язык"
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <MenuItem value="ru">Русский</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Модель</InputLabel>
                <Select
                  value={settings.model}
                  label="Модель"
                  onChange={(e) => handleSettingChange('model', e.target.value)}
                >
                  <MenuItem value="whisper-tiny">Whisper Tiny (быстро)</MenuItem>
                  <MenuItem value="whisper-base">Whisper Base</MenuItem>
                  <MenuItem value="whisper-small">Whisper Small</MenuItem>
                  <MenuItem value="whisper-medium">Whisper Medium</MenuItem>
                  <MenuItem value="whisper-large">Whisper Large (точно)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Качество</InputLabel>
                <Select
                  value={settings.quality}
                  label="Качество"
                  onChange={(e) => handleSettingChange('quality', e.target.value)}
                >
                  <MenuItem value="low">Низкое (быстро)</MenuItem>
                  <MenuItem value="medium">Среднее</MenuItem>
                  <MenuItem value="high">Высокое (медленно)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Формат вывода</InputLabel>
                <Select
                  value={settings.outputFormat}
                  label="Формат вывода"
                  onChange={(e) => handleSettingChange('outputFormat', e.target.value)}
                >
                  <MenuItem value="txt">Текстовый файл (.txt)</MenuItem>
                  <MenuItem value="srt">Субтитры (.srt)</MenuItem>
                  <MenuItem value="vtt">WebVTT (.vtt)</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Максимальный размер файла (МБ)"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Порог уверенности: {Math.round(settings.confidenceThreshold * 100)}%
                </Typography>
                <Slider
                  value={settings.confidenceThreshold}
                  onChange={(e, value) => handleSettingChange('confidenceThreshold', value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" gutterBottom>
            Дополнительные опции
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoDetectLanguage}
                    onChange={(e) => handleSettingChange('autoDetectLanguage', e.target.checked)}
                  />
                }
                label="Автоопределение языка"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.punctuation}
                    onChange={(e) => handleSettingChange('punctuation', e.target.checked)}
                  />
                }
                label="Добавить пунктуацию"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.speakerDiarization}
                    onChange={(e) => handleSettingChange('speakerDiarization', e.target.checked)}
                  />
                }
                label="Разделение по спикерам"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={handleResetSettings}
              color="warning"
            >
              Сбросить к умолчанию
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveSettings}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Уведомления о статусе сохранения */}
      <Snackbar
        open={saveStatus === 'success'}
        autoHideDuration={3000}
        onClose={() => setSaveStatus('idle')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Настройки успешно сохранены!
        </Alert>
      </Snackbar>

      <Snackbar
        open={saveStatus === 'error'}
        autoHideDuration={5000}
        onClose={() => setSaveStatus('idle')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          Ошибка сохранения настроек. Попробуйте еще раз.
        </Alert>
      </Snackbar>
    </>
  );
};

export default Settings; 