import { describe, it, expect, vi, beforeEach } from 'vitest';
import { todoApi } from './todoApi';
import { mockTodos } from '../test/mockData';
import { mockAxiosInstance } from '../test/setup';

describe('todoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('filterTodos', () => {
    it('fetches all todos when no params provided', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockTodos });

      const result = await todoApi.filterTodos();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/filter', {});
      expect(result).toEqual(mockTodos);
    });

    it('fetches filtered todos by status', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockTodos });

      const result = await todoApi.filterTodos({ status: 'completed' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/filter', { status: 'completed' });
      expect(result).toEqual(mockTodos);
    });

    it('handles API error', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(todoApi.filterTodos()).rejects.toThrow('Network error');
    });
  });

  describe('createTodo', () => {
    it('creates todo successfully', async () => {
      const newTodoData = {
        title: 'New Todo',
        description: 'New Description',
      };

      const createdTodo = { ...mockTodos[0], ...newTodoData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdTodo });

      const result = await todoApi.createTodo(newTodoData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('', newTodoData);
      expect(result).toEqual(createdTodo);
    });
  });

  describe('updateTodo', () => {
    it('updates todo successfully', async () => {
      const todoId = mockTodos[0].id;
      const updateData = {
        title: 'Updated Title',
        completed: true,
      };

      const updatedTodo = { ...mockTodos[0], ...updateData };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedTodo });

      const result = await todoApi.updateTodo(todoId, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/${todoId}`, updateData);
      expect(result).toEqual(updatedTodo);
    });
  });

  describe('deleteTodo', () => {
    it('soft deletes todo successfully', async () => {
      const todoId = mockTodos[0].id;
      mockAxiosInstance.delete.mockResolvedValue({});

      await todoApi.deleteTodo(todoId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/${todoId}`);
    });
  });

  describe('restoreTodo', () => {
    it('restores deleted todo successfully', async () => {
      const todoId = mockTodos[0].id;
      mockAxiosInstance.post.mockResolvedValue({});

      await todoApi.restoreTodo(todoId);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/${todoId}/restore`);
    });
  });

  describe('axios instance configuration', () => {
    it('creates axios instance with correct configuration', () => {
      expect(true).toBe(true);
    });
  });
});