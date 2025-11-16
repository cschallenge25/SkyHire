import api from './api';

export interface Skill {
  _id?: string;
  name: string;
  level?: string;
  category?: string;
}

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  languages: string[];
  skills: Skill[];
  education?: any[];
  experience?: any[];
  certifications?: any[];
  socialLinks?: Record<string, string>;
  preferences?: any;
  stats?: any;
  cv?: {
    originalFileName?: string;
    outputFileName?: string;
    analyzedAt?: string;
    parsedData?: any;
    metadata?: any;
  };
}

export interface ProfileResponse {
  status: string;
  data: { profile: UserProfile };
}

export interface SkillsResponse {
  status: string;
  data: { skills: Skill[] };
}

export interface StatsResponse {
  status: string;
  data: { stats: any };
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await api.get<ProfileResponse>('/api/users/profile');
    return data.data.profile;
  },

  async saveParsedCV(payload: { originalFileName?: string; output_file?: string; result?: any }): Promise<UserProfile> {
    const { data } = await api.post<ProfileResponse>('/api/users/profile/cv', payload);
    return data.data.profile;
  },

  async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await api.put<ProfileResponse>('/api/users/profile', payload);
    return data.data.profile;
  },

  async getStats(): Promise<any> {
    const { data } = await api.get<StatsResponse>('/api/users/stats');
    return data.data.stats;
    },

  async addSkill(name: string, level: string = 'intermediate', category?: string): Promise<Skill[]> {
    const { data } = await api.post<SkillsResponse>('/api/users/skills', { name, level, category });
    return data.data.skills;
  },

  async removeSkill(skillId: string): Promise<Skill[]> {
    const { data } = await api.delete<SkillsResponse>(`/api/users/skills/${skillId}`);
    return data.data.skills;
  },
  
  // Crew Network: connections
  async getConnections(): Promise<any[]> {
    const { data } = await api.get('/api/users/connections');
    return data?.data?.connections || [];
  },

  async getPendingRequests(): Promise<any[]> {
    const { data } = await api.get('/api/users/connections/requests');
    return data?.data?.requests || [];
  },

  async getConnectionStatus(userId: string): Promise<{ status: string; connectionId?: string }> {
    const { data } = await api.get(`/api/users/connections/status/${userId}`);
    return data?.data || { status: 'none' };
  },

  async sendConnectionRequest(userId: string): Promise<any> {
    const { data } = await api.post(`/api/users/connections/request/${userId}`);
    return data?.data || {};
  },

  async acceptConnection(id: string): Promise<any> {
    const { data } = await api.post(`/api/users/connections/accept/${id}`);
    return data?.data || {};
  },

  async rejectConnection(id: string): Promise<any> {
    const { data } = await api.post(`/api/users/connections/reject/${id}`);
    return data?.data || {};
  },

  async removeConnection(id: string): Promise<any> {
    const { data } = await api.delete(`/api/users/connections/${id}`);
    return data?.data || {};
  },

  // Users search for discovery
  async searchUsers(params: Partial<{ query: string; skills: string; location: string; role: string; page: number; limit: number }>): Promise<{ users: any[]; page: number; pages: number; total: number; }>{
    const { data } = await api.get('/api/users/search', { params });
    const payload = data?.data || {};
    return {
      users: payload.users || [],
      page: payload.pagination?.page || 1,
      pages: payload.pagination?.pages || 1,
      total: payload.pagination?.total || 0,
    };
  },
};
