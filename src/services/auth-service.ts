import { apiClient } from "./api-client";
import { LoginRequest, AuthResponse } from "../types/api";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/api/Auth/login",
      credentials
    );
    return response.data;
  },

  async register(userData: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/api/Auth/register",
      userData
    );
    return response.data;
  },

  logout(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem("authToken");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
