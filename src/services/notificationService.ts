import { api } from './api';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  items: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationService = {
  getNotifications: async (page = 1, limit = 10) => {
    return api<NotificationsResponse>(`v1/notifications?page=${page}&limit=${limit}`);
  },
  
  markAllAsRead: async () => {
    return api<any>('v1/notifications/read-all', {
      method: 'PATCH'
    });
  },
  
  markAsRead: async (id: string) => {
    return api<any>(`v1/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }
};
