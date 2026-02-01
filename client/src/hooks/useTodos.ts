import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateTodoRequest, UpdateTodoRequest, FilterType, ApiTodo } from '@shared/types/api';
import { todoApi } from '../api/todoApi';

// Query keys
const QUERY_KEYS = {
  todos: ['todos'],
  completedTodos: ['todos', 'completed'],
  pendingTodos: ['todos', 'pending'],
  todo: (id: string) => ['todos', id],
};

// Get todos based on filter
export const useTodos = (filter: FilterType = 'all') => {
  return useQuery({
    queryKey: filter === 'all' ? QUERY_KEYS.todos : 
              filter === 'completed' ? QUERY_KEYS.completedTodos : 
              QUERY_KEYS.pendingTodos,
    queryFn: () => {
      switch (filter) {
        case 'completed':
          return todoApi.getCompletedTodos();
        case 'pending':
          return todoApi.getPendingTodos();
        default:
          return todoApi.getTodos();
      }
    },
  });
};

// Get single todo
export const useTodo = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.todo(id),
    queryFn: () => todoApi.getTodoById(id),
    enabled: !!id,
  });
};

// Create todo mutation
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: CreateTodoRequest) => todoApi.createTodo(todo),
    onSuccess: () => {
      // Invalidate and refetch all todos queries
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// Update todo mutation
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, todo }: { id: string; todo: UpdateTodoRequest }) =>
      todoApi.updateTodo(id, todo),
    onSuccess: () => {
      // Invalidate and refetch all todos queries
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// Delete todo mutation
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: () => {
      // Invalidate and refetch all todos queries
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

type SearchTodosParams = {
  query?: string;
  status?: 'pending' | 'completed';
};

export const useSearchTodos = ({ query, status }: SearchTodosParams) => {
  const hasQuery = Boolean(query && query.trim().length > 0);

  return useQuery({
    queryKey: ['todos', 'search', query, status],
    queryFn: () =>
      todoApi.searchTodos({
        query: query?.trim(),
        status,
      }),
    enabled: hasQuery,
    staleTime: 1000 * 60,
  });
};


