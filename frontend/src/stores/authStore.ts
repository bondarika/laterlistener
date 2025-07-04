import { makeAutoObservable } from 'mobx';
import { postUserData, getUserData, logoutUser } from '../services/api';
import type { UserData } from '../types/UserData';

class AuthStore {
  userId: string | null = null;
  isAuthenticated: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async registerWithTelegram(userData: UserData) {
    try {
      await postUserData({ id: userData.id }); // токен кладётся в cookie
      // теперь делаем запрос whoami, чтобы получить userId и убедиться, что авторизация прошла
      const user = await getUserData();
      this.userId = user.id;
      this.isAuthenticated = true;
    } catch (error) {
      // ошибки потом норм сделать надо
      console.error('Registration failed:', error);
    }
  }

  async logout() {
    // запрос на logout к бэку (напомнить им удалить токен из куки)
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
