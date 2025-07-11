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
    console.log('[Auth] Start exchangeOneTimeTokenForJWT', { oneTimeToken });
    try {
      const tokens = await exchangeTokenForJWT(oneTimeToken); // { accessToken, refreshToken }
      console.log('[Auth] Token exchange success', tokens);
      this.saveTokens(tokens.accessToken, tokens.refreshToken);
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('[Auth] Token exchange failed:', error);
      this.logout();
      return false;
    }
  }

  async refreshTokens() {
    console.log('[Auth] Start refreshTokens', { refreshToken: this.refreshToken });
    if (!this.refreshToken) {
      console.error('[Auth] No refresh token available');
      throw new Error('No refresh token available');
    }
    try {
      const tokens = await refreshTokens(this.refreshToken);
      console.log('[Auth] Token refresh success', tokens);
      this.saveTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  saveTokens(accessToken: string, refreshToken: string) {
    console.log('[Auth] Save tokens', { accessToken, refreshToken });
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.isAuthenticated = true;
  }

  loadTokens() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('[Auth] Load tokens', { accessToken, refreshToken });
    if (accessToken && refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;
    } else {
      this.isAuthenticated = false;
    }
  }

  logout() {
    console.log('[Auth] Logout');
    this.accessToken = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    logoutUser();
  }
}

export const authStore = new AuthStore();
