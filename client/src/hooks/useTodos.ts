import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateTodoRequest, UpdateTodoRequest, FilterType, ApiTodo } from '@shared/types/api';
import { todoApi } from '../api/todoApi';

const QUERY_KEYS = {
  todos: ['todos'],
  todo: (id: string) => ['todos', id],
  filteredTodos: (query?: string, status?: FilterType) => ['todos', 'search', query ?? '', status ?? 'all'],
};

export const useFilteredTodos = ({ query, status }: { query?: string; status?: FilterType }) => {
  const trimmedQuery = query?.trim();

  return useQuery({
    queryKey: QUERY_KEYS.filteredTodos(trimmedQuery, status),
    queryFn: () => todoApi.filterTodos({ query: trimmedQuery, status: status === 'all' ? undefined : status }),
    staleTime: 1000 * 30,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (todo: CreateTodoRequest) => todoApi.createTodo(todo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, todo }: { id: string; todo: UpdateTodoRequest }) =>
      todoApi.updateTodo(id, todo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', variables.id] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', id] });
    },
  });
};

