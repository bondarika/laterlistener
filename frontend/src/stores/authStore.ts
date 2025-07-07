import { makeAutoObservable } from 'mobx';
import { postUserData, getUserData, logoutUser } from '../services/api';
import type { UserData } from '../types/UserData';

class AuthStore {
  userId: string | null = null;
  isAuthenticated: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async login(userData: UserData) {
    try {
      await postUserData(userData); // Pass the complete userData object
      // теперь делаем get-запрос, чтобы получить userId и убедиться, что авторизация прошла
      const user = await getUserData();
      this.userId = user.id;
      this.isAuthenticated = true;
    } catch (error) {
      // ошибки потом норм сделать надо
      console.error('Registration failed:', error);
    }
  }

  async logout() {
    await logoutUser();
    this.userId = null;
    this.isAuthenticated = false;
  }

  async checkAuth() {
    try {
      const user = await getUserData();
      this.userId = user.id;
      this.isAuthenticated = true;
    } catch {
      this.userId = null;
      this.isAuthenticated = false;
    }
  }
}

export const authStore = new AuthStore();
