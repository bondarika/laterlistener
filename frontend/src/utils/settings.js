// Утилиты для работы с настройками транскрибуции

const SETTINGS_KEY = 'transcription_settings';

// Настройки по умолчанию
export const defaultSettings = {
  language: 'ru',
  model: 'whisper-large',
  quality: 'high',
  autoDetectLanguage: true,
  punctuation: true,
  speakerDiarization: false,
  confidenceThreshold: 0.8,
  maxFileSize: 50,
  outputFormat: 'txt'
};

// Загрузка настроек из localStorage
export const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Объединяем с настройками по умолчанию на случай, если добавились новые поля
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error);
  }
  return defaultSettings;
};

// Сохранение настроек в localStorage
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    return false;
  }
};

// Сброс настроек к умолчанию
export const resetSettings = () => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Ошибка сброса настроек:', error);
    return false;
  }
};

// Получение конкретной настройки
export const getSetting = (key) => {
  const settings = loadSettings();
  return settings[key];
};

// Обновление конкретной настройки
export const updateSetting = (key, value) => {
  const settings = loadSettings();
  settings[key] = value;
  return saveSettings(settings);
};

// Проверка, есть ли сохраненные настройки
export const hasSavedSettings = () => {
  return localStorage.getItem(SETTINGS_KEY) !== null;
};

// Экспорт настроек для API
export const getSettingsForAPI = () => {
  const settings = loadSettings();
  return {
    language: settings.language,
    model: settings.model,
    quality: settings.quality,
    auto_detect_language: settings.autoDetectLanguage,
    punctuation: settings.punctuation,
    speaker_diarization: settings.speakerDiarization,
    confidence_threshold: settings.confidenceThreshold,
    max_file_size: settings.maxFileSize,
    output_format: settings.outputFormat
  };
}; 