import axios from 'axios';
import { Task } from '../types';
import { formatDateForInput, createDateInUserTimezone } from '../utils/dateUtils';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
  message: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },
};

export const tasksAPI = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data.map((task: any) => ({
      ...task,
      dueDate: task.dueDate ? createDateInUserTimezone(task.dueDate) : null,
      createdAt: new Date(task.createdAt)
    }));
  },

  createTask: async (task: Omit<Task, 'createdAt'>): Promise<Task> => {
    const response = await api.post('/tasks', {
      id: task.id,
      title: task.title,
      dueDate: task.dueDate ? formatDateForInput(task.dueDate) : null,
      completed: task.completed
    });
    return {
      ...response.data,
      dueDate: response.data.dueDate ? createDateInUserTimezone(response.data.dueDate) : null,
      createdAt: new Date(response.data.createdAt)
    };
  },

  updateTask: async (task: Task): Promise<Task> => {
    const response = await api.put(`/tasks/${task.id}`, {
      title: task.title,
      dueDate: task.dueDate ? formatDateForInput(task.dueDate) : null,
      completed: task.completed
    });
    return {
      ...response.data,
      dueDate: response.data.dueDate ? createDateInUserTimezone(response.data.dueDate) : null,
      createdAt: task.createdAt
    };
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};