import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./api/todoApi', () => ({
  todoApi: {
    getTodos: vi.fn(),
    getCompletedTodos: vi.fn(),
    getPendingTodos: vi.fn(),
    getTodoById: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    searchTodos: vi.fn(),
  },
}));

import { todoApi } from './api/todoApi';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (todoApi.getTodos as any).mockResolvedValue([]);
  });

  it('renders main app structure', () => {
    render(<App />);
    expect(screen.getByText(/todo app/i)).toBeInTheDocument();
  });

  it('renders header with correct title', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /todo app/i })
    ).toBeInTheDocument();
  });

  it('initializes with "All" filter active', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /all/i })).toHaveClass('active');
  });

  it('updates filter when clicking Completed', async () => {
    const user = userEvent.setup();

    (todoApi.getCompletedTodos as any).mockResolvedValue([]);

    render(<App />);

    const completedBtn = screen.getByRole('button', { name: /completed/i });
    await user.click(completedBtn);

    expect(completedBtn).toHaveClass('active');
    expect(screen.getByRole('button', { name: /all/i })).not.toHaveClass(
      'active'
    );
  });

  it('adds a todo and searches for it', async () => {
    const user = userEvent.setup();

    const todo = {
      id: '1',
      title: 'Buy milk',
      description: '',
      completed: false,
    };

    (todoApi.getTodos as any).mockResolvedValue([todo]);

    (todoApi.getCompletedTodos as any).mockResolvedValue([
      { ...todo, completed: true },
    ]);

    (todoApi.createTodo as any).mockResolvedValue(todo);

    render(<App />);

    const formInput = screen.getByPlaceholderText(/enter todo title\.\.\./i);
    const searchInput = screen.getByPlaceholderText(/^enter todo title$/i);
    const addBtn = screen.getByRole('button', { name: /add todo/i });

    await user.type(formInput, 'Buy milk');
    await user.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText(/buy milk/i)).toBeInTheDocument();
    });
    const completedBtn = screen.getByRole('button', { name: /completed/i });
    await user.click(completedBtn);
    await user.type(searchInput, 'milk');
    expect(searchInput).toHaveValue('milk');
    expect(screen.getByText(/buy milk/i)).toBeInTheDocument();
  });
});
