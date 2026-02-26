import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test/utils';
import TodoList from './TodoList';
import { mockTodos, mockCompletedTodos, mockPendingTodos } from '../test/mockData';
import * as useTodosHooks from '../hooks/useTodos';

vi.mock('../hooks/useTodos');
vi.mock('./TodoItem', () => ({
  default: ({ todo }: any) => (
    <div data-testid={`todo-item-${todo.id}`}>
      {todo.title}
    </div>
  )
}));

describe('TodoList (new filtered API)', () => {
  const mockUseFilteredTodos = vi.mocked(useTodosHooks.useFilteredTodos);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="all" />);

    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch todos'),
    } as any);

    render(<TodoList filter="all" />);

    expect(screen.getByText('Failed to fetch todos')).toBeInTheDocument();
  });

  it('renders unknown error state', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: null,
    } as any);

    render(<TodoList filter="all" />);

    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });

  it('renders empty state for all todos', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="all" />);

    expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
  });

  it('renders empty state for completed todos', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="completed" />);

    expect(screen.getByText('No completed todos.')).toBeInTheDocument();
  });

  it('renders empty state for pending todos', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="pending" />);

    expect(screen.getByText('No pending todos.')).toBeInTheDocument();
  });

  it('renders empty state for deleted todos', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="deleted" />);

    expect(screen.getByText('No deleted todos.')).toBeInTheDocument();
  });

  it('renders list of todos', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="all" />);

    expect(screen.getByText('3 todos')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-3')).toBeInTheDocument();
  });

  it('renders single todo with singular count', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: [mockTodos[0]],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="all" />);

    expect(screen.getByText('1 todo')).toBeInTheDocument();
  });

  it('renders filtered label', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: mockCompletedTodos,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="completed" />);

    expect(screen.getByText('1 todo (completed)')).toBeInTheDocument();
  });

  it('calls useFilteredTodos with correct params', () => {
    mockUseFilteredTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<TodoList filter="completed" searchQuery="react" />);

    expect(mockUseFilteredTodos).toHaveBeenCalledWith({
      query: 'react',
      status: 'completed',
    });
  });
});