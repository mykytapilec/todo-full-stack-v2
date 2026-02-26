import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as useTodosHooks from './hooks/useTodos';

vi.mock('./hooks/useTodos');
const mockedUseFilteredTodos = vi.mocked(useTodosHooks.useFilteredTodos);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main app structure', () => {
    mockedUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<App />);
    expect(screen.getByText(/todo app/i)).toBeInTheDocument();
  });

  it('renders header with correct title', () => {
    mockedUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<App />);
    expect(screen.getByRole('heading', { name: /todo app/i })).toBeInTheDocument();
  });

  it('initializes with "All" filter active', () => {
    mockedUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<App />);
    expect(screen.getByRole('button', { name: /all/i })).toHaveClass('active');
  });

  it('updates filter when clicking Completed', async () => {
    const user = userEvent.setup();

    mockedUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<App />);
    const completedBtn = screen.getByRole('button', { name: /completed/i });
    await user.click(completedBtn);

    expect(completedBtn).toHaveClass('active');
    expect(screen.getByRole('button', { name: /all/i })).not.toHaveClass('active');
  });

  it('adds a todo and searches for it', async () => {
    const user = userEvent.setup();

    const todo = {
      id: '1',
      title: 'Buy milk',
      description: '',
      completed: false,
    };

    mockedUseFilteredTodos.mockReturnValueOnce({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    mockedUseFilteredTodos.mockReturnValueOnce({
      data: [todo],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<App />);

    const formInput = screen.getByPlaceholderText(/enter todo title/i);
    const addBtn = screen.getByRole('button', { name: /add todo/i });

    await user.type(formInput, 'Buy milk');
    await user.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText(/buy milk/i)).toBeInTheDocument();
    });

    // Симулируем поиск по названию
    const searchInput = screen.getByPlaceholderText(/enter todo title/i);
    await user.type(searchInput, 'milk');

    expect(searchInput).toHaveValue('milk');
    expect(screen.getByText(/buy milk/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockedUseFilteredTodos.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<App />);
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Failed to fetch todos';
    mockedUseFilteredTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error(errorMessage),
    } as any);

    render(<App />);
    expect(screen.getByText(`Failed to load todos: ${errorMessage}`)).toBeInTheDocument();
  });

  it('renders error state with unknown error', () => {
    mockedUseFilteredTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: null,
    } as any);

    render(<App />);
    expect(screen.getByText('Failed to load todos: Unknown error')).toBeInTheDocument();
  });
});