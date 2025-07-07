// Утилиты для работы с настройками транскрибуции

const SETTINGS_KEY = 'transcription_settings';

// Типы для настроек
export interface SettingsType {
  language: string;
  model: string;
  quality: string;
  autoDetectLanguage: boolean;
  punctuation: boolean;
  speakerDiarization: boolean;
  confidenceThreshold: number;
  maxFileSize: number;
  outputFormat: string;
}

// Настройки по умолчанию
export const defaultSettings: SettingsType = {
  language: 'ru',
  model: 'whisper-large',
  quality: 'high',
  autoDetectLanguage: true,
  punctuation: true,
  speakerDiarization: false,
  confidenceThreshold: 0.8,
  maxFileSize: 50,
  outputFormat: 'txt',
};

// Загрузка настроек из localStorage
export const loadSettings = (): SettingsType => {
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
export const saveSettings = (settings: SettingsType): boolean => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    return false;
  }
};

// Сброс настроек к умолчанию
export const resetSettings = (): boolean => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Ошибка сброса настроек:', error);
    return false;
  }
};

// Получение конкретной настройки
export const getSetting = (key: keyof SettingsType): SettingsType[keyof SettingsType] => {
  const settings = loadSettings();
  return settings[key];
};

// Обновление конкретной настройки
export const updateSetting = <K extends keyof SettingsType>(
  key: K,
  value: SettingsType[K],
): boolean => {
  const settings = loadSettings();
  settings[key] = value;
  return saveSettings(settings);
};

// Проверка, есть ли сохраненные настройки
export const hasSavedSettings = (): boolean => {
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
    output_format: settings.outputFormat,
  };
};
