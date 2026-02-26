import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as useTodosHooks from './hooks/useTodos';

vi.mock('./hooks/useTodos');

const mockedUseFilteredTodos = vi.mocked(useTodosHooks.useFilteredTodos);
const mockedUseCreateTodo = vi.mocked(useTodosHooks.useCreateTodo);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseFilteredTodos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    mockedUseCreateTodo.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('renders main app structure', () => {
    render(<App />);
    expect(screen.getByText(/todo app/i)).toBeInTheDocument();
  });

  it('initializes with "All" filter active', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /all/i })).toHaveClass('active');
  });

  it('updates filter when clicking Completed', async () => {
    const user = userEvent.setup();

    render(<App />);
    const completedBtn = screen.getByRole('button', { name: /completed/i });
    await user.click(completedBtn);

    expect(completedBtn).toHaveClass('active');
  });

  it('calls createTodo mutation when submitting form', async () => {
  const user = userEvent.setup();

  const mutateMock = vi.fn();

  mockedUseCreateTodo.mockReturnValue({
    mutate: mutateMock,
    isPending: false,
  } as any);

  render(<App />);

  const input = screen.getByPlaceholderText('Enter todo title...');
  const button = screen.getByRole('button', { name: /add todo/i });

  await user.type(input, 'Buy milk');
  await user.click(button);

  expect(mutateMock).toHaveBeenCalledTimes(1);
  expect(mutateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Buy milk',
    }),
    expect.any(Object)
  );
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
    mockedUseFilteredTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
    } as any);

    render(<App />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});