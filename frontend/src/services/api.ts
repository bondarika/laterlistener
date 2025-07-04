import axios from 'axios';
import type { UserData } from '../types/UserData';

// УРЛ НЕ ЗАБЫТЬ ПОМЕНЯТЬ И ВСЕ ЭНДПОИНТЫ
const API_BASE_URL = 'https://api.example.com';

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
  } catch (error: any) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
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
