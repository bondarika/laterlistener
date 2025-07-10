import { makeAutoObservable } from 'mobx';
import { exchangeTokenForJWT, logoutUser, refreshTokens } from '../services/api';

class AuthStore {
  accessToken: string | null = null;
  refreshToken: string | null = null;
  isAuthenticated: boolean = false;

  constructor() {
    makeAutoObservable(this);
    this.loadTokens();
  }

  async exchangeOneTimeTokenForJWT(oneTimeToken: string) {
    try {
      const tokens = await exchangeTokenForJWT(oneTimeToken); // { accessToken, refreshToken }
      this.saveTokens(tokens.accessToken, tokens.refreshToken);
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('Token exchange failed:', error);
      this.logout();
      return false;
    }
  }

  async refreshTokens() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    try {
      const tokens = await refreshTokens(this.refreshToken);
      this.saveTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.isAuthenticated = true;
  }

  loadTokens() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;
    } else {
      this.isAuthenticated = false;
    }
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    logoutUser();
  }
}

export const authStore = new AuthStore();
