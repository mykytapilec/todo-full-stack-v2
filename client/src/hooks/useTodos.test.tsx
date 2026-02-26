import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFilteredTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useRestoreTodo,
} from './useTodos';
import { todoApi } from '../api/todoApi';
import { mockTodos } from '../test/mockData';
import { ReactNode } from 'react';

vi.mock('../api/todoApi');
const mockedTodoApi = vi.mocked(todoApi);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTodos hooks (new API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================
  // useFilteredTodos
  // =============================

  describe('useFilteredTodos', () => {
    it('fetches todos with no filters', async () => {
      mockedTodoApi.filterTodos.mockResolvedValue(mockTodos);

      const { result } = renderHook(
        () => useFilteredTodos({}),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTodoApi.filterTodos).toHaveBeenCalledWith({
        query: undefined,
        status: undefined,
      });

      expect(result.current.data).toEqual(mockTodos);
    });

    it('fetches todos with status filter', async () => {
      mockedTodoApi.filterTodos.mockResolvedValue(mockTodos);

      const { result } = renderHook(
        () => useFilteredTodos({ status: 'completed' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTodoApi.filterTodos).toHaveBeenCalledWith({
        query: undefined,
        status: 'completed',
      });
    });

    it('handles API error', async () => {
      mockedTodoApi.filterTodos.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(
        () => useFilteredTodos({}),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('API Error'));
    });
  });

  // =============================
  // useCreateTodo
  // =============================

  describe('useCreateTodo', () => {
    it('creates todo successfully', async () => {
      const newTodo = mockTodos[0];
      mockedTodoApi.createTodo.mockResolvedValue(newTodo);

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ title: 'New Todo' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTodoApi.createTodo).toHaveBeenCalledWith({
        title: 'New Todo',
      });
    });
  });

  // =============================
  // useUpdateTodo
  // =============================

  describe('useUpdateTodo', () => {
    it('updates todo successfully', async () => {
      const updatedTodo = { ...mockTodos[0], title: 'Updated' };
      mockedTodoApi.updateTodo.mockResolvedValue(updatedTodo);

      const { result } = renderHook(() => useUpdateTodo(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: mockTodos[0].id,
        todo: { title: 'Updated' },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTodoApi.updateTodo).toHaveBeenCalledWith(
        mockTodos[0].id,
        { title: 'Updated' }
      );
    });
  });

  // =============================
  // useDeleteTodo
  // =============================

  describe('useDeleteTodo', () => {
    it('deletes todo successfully', async () => {
      mockedTodoApi.deleteTodo.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteTodo(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockTodos[0].id);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTodoApi.deleteTodo).toHaveBeenCalledWith(
        mockTodos[0].id
      );
    });
  });

  // =============================
  // useRestoreTodo
  // =============================

  describe('useRestoreTodo', () => {
    it('restores todo successfully', async () => {
      mockedTodoApi.restoreTodo.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRestoreTodo(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockTodos[0].id);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTodoApi.restoreTodo).toHaveBeenCalledWith(
        mockTodos[0].id
      );
    });
  });
});