import axios from 'axios';
import { ApiTodo, CreateTodoRequest, UpdateTodoRequest } from '@shared/types/api';

const api = axios.create({ baseURL: '/api/todos', headers: { 'Content-Type': 'application/json' } });

export const todoApi = {
  filterTodos: async (params?: { query?: string; status?: 'pending' | 'completed' }): Promise<ApiTodo[]> => {
    const response = await api.post<ApiTodo[]>('/filter', params || {});
    return response.data;
  },

  createTodo: async (todo: CreateTodoRequest): Promise<ApiTodo> => {
    const response = await api.post<ApiTodo>('', todo);
    return response.data;
  },

  updateTodo: async (id: string, todo: UpdateTodoRequest): Promise<ApiTodo> => {
    const response = await api.put<ApiTodo>(`/${id}`, todo);
    return response.data;
  },

  deleteTodo: async (id: string): Promise<void> => {
    await api.put(`/${id}/delete`);
  },
};
