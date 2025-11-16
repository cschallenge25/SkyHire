import api from './api';

export type NotificationItem = {
  _id: string;
  userId: string;
  type: 'connection' | 'message' | 'job' | 'system' | string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
};

export const notificationService = {
  async getList(params?: Partial<{ page: number; limit: number; unreadOnly: boolean }>): Promise<{
    notifications: NotificationItem[];
    page: number;
    pages: number;
    total: number;
    unread: number;
  }> {
    const q: any = { ...params };
    if (typeof params?.unreadOnly === 'boolean') {
      q.unreadOnly = params.unreadOnly ? 'true' : 'false';
    }
    const { data } = await api.get('/api/notifications', { params: q });
    const payload = data?.data || {};
    return {
      notifications: payload.notifications || [],
      page: payload.pagination?.page || 1,
      pages: payload.pagination?.pages || 1,
      total: payload.pagination?.total || 0,
      unread: payload.stats?.unread || 0,
    };
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/api/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/api/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/notifications/${id}`);
  },

  async getStats(): Promise<{ total: number; unread: number; byType?: any[]; }> {
    const { data } = await api.get('/api/notifications/stats');
    const stats = data?.data?.stats || {};
    return {
      total: stats.total || 0,
      unread: stats.unread || 0,
      byType: stats.byType || [],
    };
  },
};
