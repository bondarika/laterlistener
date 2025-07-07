import axios from 'axios';
import type { UserData } from '../types/UserData';
import type { Transcript, TranscriptUpdate, Summary, UploadResponse } from '../types/Transcript';

const API_BASE_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

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
