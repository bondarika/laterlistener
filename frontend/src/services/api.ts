import axios from 'axios';
import type { UserData } from '../types/UserData';
import type { Transcript, TranscriptUpdate, Summary, UploadResponse } from '../types/Transcript';

const API_BASE_URL = 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Добавляем перехватчик для автоматической подстановки JWT
axiosInstance.interceptors.request.use((config) => {
  // Не добавляем токен для обмена одноразового токена на JWT
  if (config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/one-time'))) {
    return config;
  }
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// Добавляем перехватчик ответов для автоматического обновления токенов
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { authStore } = await import('../stores/authStore');
          const success = await authStore.refreshTokens();
          if (success) {
            // Повторяем оригинальный запрос с новым токеном
            const newAccessToken = localStorage.getItem('accessToken');
            if (newAccessToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Если обновление токена не удалось, перенаправляем на логин
        const { authStore } = await import('../stores/authStore');
        authStore.logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export const postUserData = async (userData: UserData) => {
  try {
    const response = await axiosInstance.post('/auth/register', {
      telegram_id: userData?.id,
    });
    return response.data;
  } catch (error) {
    console.error('Error during Telegram login:', error);
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const response = await axiosInstance.get('/auth/login');

    if (response.data && response.data.user) {
      return response.data.user;
    } else {
      throw new Error('User data not found in response');
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      // @ts-expect-error: error.response is not typed on unknown error, but is present for Axios errors
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error instanceof Error) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getAllTranscripts = async (): Promise<Transcript[]> => {
  try {
    const response = await axiosInstance.get('/api/transcripts');
    return response.data;
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    throw error;
  }
};

export const getTranscriptById = async (id: string): Promise<Transcript> => {
  try {
    const response = await axiosInstance.get(`/api/transcripts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};

export const updateTranscript = async (
  id: string,
  update: TranscriptUpdate,
): Promise<Transcript> => {
  try {
    const response = await axiosInstance.put(`/api/transcripts/${id}`, update);
    return response.data;
  } catch (error) {
    console.error('Error updating transcript:', error);
    throw error;
  }
};

export const getTranscriptSummary = async (id: string): Promise<Summary> => {
  try {
    const response = await axiosInstance.get(`/api/transcripts/${id}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transcript summary:', error);
    throw error;
  }
};

export const downloadTranscript = async (id: string, format: 'txt' | 'pdf'): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(`/api/transcripts/${id}/download?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading transcript:', error);
    throw error;
  }
};

export const uploadAudioFile = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading audio file:', error);
    throw error;
  }
};

// Обмен одноразового токена на JWT
export const exchangeTokenForJWT = async (
  oneTimeToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await axiosInstance.post(`/auth/one-time?token=${oneTimeToken}`);
    // Согласно TokenPair схеме: { access_token, refresh_token, token_type }
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  } catch (error) {
    console.error('Error exchanging one-time token for JWT:', error);
    throw error;
  }
};

// Types for transcribe API
export interface TranscribeStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export interface StartTranscribeResponse {
  task_id: string;
  status: 'processing' | 'queued';
}

// API транскрибации согласно OpenAPI спецификации
export const startTranscribe = async (
  fileUrl: string,
  fileName: string,
): Promise<StartTranscribeResponse> => {
  try {
    const response = await axiosInstance.post('/transcribe', {
      file_url: fileUrl,
      file_name: fileName,
    });
    return response.data;
  } catch (error) {
    console.error('Error starting transcribe:', error);
    throw error;
  }
};

export const getTranscribeStatus = async (taskId: string): Promise<TranscribeStatus> => {
  try {
    const response = await axiosInstance.get(`/status/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting transcribe status:', error);
    throw error;
  }
};

export const getTranscribeResult = async (taskId: string): Promise<Transcript> => {
  try {
    const response = await axiosInstance.get(`/result/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting transcribe result:', error);
    throw error;
  }
};

// Обновление токенов
export const refreshTokens = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await axiosInstance.post(`/auth/refresh?refresh_token=${refreshToken}`);
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    throw error;
  }
};

// Получение информации о пользователе
export const getMe = async (): Promise<UserData> => {
  try {
    const response = await axiosInstance.get('/me');
    return response.data;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
};
