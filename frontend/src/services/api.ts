import axios from 'axios';
import { LoginCredentials, AuthResponse, DashboardStats, Document, ExtractedInfo, Difference } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export const documentService = {
  getDocuments: async (): Promise<Document[]> => {
    const response = await api.get('/documents');
    return response.data;
  }
};

export const dataService = {
  getCheckData: async (): Promise<ExtractedInfo[]> => {
    const response = await api.get('/check-data');
    return response.data;
  },
  getDifferences: async (): Promise<Difference[]> => {
    const response = await api.get('/differences');
    return response.data;
  }
};

export const queryService = {
  raiseToSupervisor: async (data: { query: string; document_id?: number; document_name?: string; raised_by: string; raised_by_role: string }) => {
    const response = await api.post('/queries/supervisor', data);
    return response.data;
  },
  supervisorRespond: async (queryId: number, data: { response: string; responded_by: string }) => {
    const response = await api.post(`/queries/${queryId}/respond`, data);
    return response.data;
  },
  raiseToPM: async (reportId: number, data: { query: string; action_requested: string }) => {
    const response = await api.post(`/reports/${reportId}/query`, data);
    return response.data;
  },
  pmResolve: async (queryId: number, data: { resolution: string; resolved_by: string }) => {
    const response = await api.post(`/queries/pm/${queryId}/resolve`, data);
    return response.data;
  },
  aiAssist: async (question: string) => {
    const response = await api.post('/ai/query', { question });
    return response.data;
  }
};

export const messageService = {
  getContacts: async () => {
    const response = await api.get('/messages/contacts');
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
  getMessages: async (userId: number) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },
  sendMessage: async (recipientId: number, content: string) => {
    const response = await api.post('/messages', { recipient_id: recipientId, content });
    return response.data;
  },
  markAsRead: async (userId: number) => {
    const response = await api.put(`/messages/${userId}/read`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  }
};

export default api;
