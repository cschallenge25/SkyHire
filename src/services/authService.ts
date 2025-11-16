// services/authService.ts
import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'candidate' | 'recruiter' | 'admin';
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Authentification réelle via API Gateway
export const authService = {
  // Login utilisateur
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data?.status !== 'success' || !data?.token || !data?.user) {
        throw new Error(data?.message || 'Login failed');
      }
      const token: string = data.token;
      const user: User = data.user;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (e: any) {
      // Gérer les différents types d'erreurs
      if (e?.response?.status === 401) {
        throw new Error('Email ou mot de passe incorrect');
      }
      if (e?.response?.status === 404) {
        throw new Error('Utilisateur non trouvé');
      }
      if (e?.code === 'ECONNREFUSED' || e?.code === 'ERR_NETWORK') {
        throw new Error('Impossible de contacter le serveur');
      }
      const msg = e?.response?.data?.message || e?.message || 'Erreur de connexion';
      throw new Error(msg);
    }
  },

  // Mise à jour du profil Auth (ex: name)
  async updateProfile(payload: Partial<{ name: string; avatar: string; bio: string; location: string; phone: string; languages: string[]; skills: any[]; experience: any[] }>): Promise<User> {
    try {
      const { data } = await api.put('/api/auth/profile', payload);
      if (data?.status !== 'success' || !data?.user) {
        throw new Error(data?.message || 'Failed to update profile');
      }
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
        createdAt: new Date(),
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to update profile';
      throw new Error(msg);
    }
  },

  // Inscription nouvel utilisateur
  async signUp(email: string, password: string, name: string, role?: 'candidate' | 'recruiter' | 'admin'): Promise<AuthResponse> {
    try {
      const { data } = await api.post('/api/auth/signup', { name, email, password, ...(role ? { role } : {}) });
      if (data?.status !== 'success' || !data?.token || !data?.user) {
        throw new Error(data?.message || 'Registration failed');
      }
      const token: string = data.token;
      const user: User = data.user;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Registration failed';
      throw new Error(msg);
    }
  },

  // Déconnexion
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Vérifier le token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { data } = await api.put('/api/auth/change-password', { currentPassword, newPassword });
    if (data?.status !== 'success') {
      throw new Error(data?.message || 'Failed to change password');
    }
  },

  // Supprimer le compte
  async deleteAccount(): Promise<void> {
    const { data } = await api.delete('/api/auth/account');
    if (data?.status !== 'success') {
      throw new Error(data?.message || 'Failed to delete account');
    }
  }
};