import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoController } from './todoController';
import { TodoService } from '../services/todoService';
import { Todo } from '../types/todo';
import { CreateTodoRequest } from '@shared/types/api';
import { AppError, createNotFoundError } from '../types/errors';

describe('TodoController', () => {
  let todoService: TodoService;
  let todoController: TodoController;
  let res: any;

  beforeEach(() => {
    todoService = {
      getAllTodos: vi.fn(),
      getTodoById: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
      filter: vi.fn(),
      getDeletedTodos: vi.fn(),
      restoreTodo: vi.fn(),
    } as unknown as TodoService;

    todoController = new TodoController(todoService);

    res = {
      status: vi.fn(() => res),
      json: vi.fn(() => res),
      send: vi.fn(() => res),
    };
  });

  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'desc',
    status: 'pending',
    completionMessage: 'done',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('getAllTodos should return todos', async () => {
    (todoService.getAllTodos as any).mockResolvedValue({
      isOk: () => true,
      value: [mockTodo],
      isErr: () => false,
    });

    await todoController.getAllTodos({} as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        createdAt: mockTodo.createdAt,
        updatedAt: mockTodo.updatedAt,
        completed: false,
      },
    ]);
  });

  it('getTodoById should return a single todo', async () => {
    (todoService.getTodoById as any).mockResolvedValue({
      isOk: () => true,
      value: mockTodo,
      isErr: () => false,
    });

    await todoController.getTodoById({ params: { id: '1' } } as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: mockTodo.id,
      title: mockTodo.title,
      description: mockTodo.description,
      createdAt: mockTodo.createdAt,
      updatedAt: mockTodo.updatedAt,
      completed: false,
    });
  });

  it('getTodoById should return 404 if not found', async () => {
    const notFoundError: AppError = createNotFoundError('Todo', '1');

    (todoService.getTodoById as any).mockResolvedValue({
      isOk: () => false,
      isErr: () => true,
      error: notFoundError,
    });

    await todoController.getTodoById({ params: { id: '1' } } as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: notFoundError.message });
  });

  it('createTodo should create and return a todo', async () => {
    const payload: CreateTodoRequest = { title: 'Test Todo', description: 'desc' };

    (todoService.createTodo as any).mockResolvedValue({
      isOk: () => true,
      value: mockTodo,
      isErr: () => false,
    });

    await todoController.createTodo({ body: payload } as any, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: mockTodo.id,
      title: mockTodo.title,
      description: mockTodo.description,
      createdAt: mockTodo.createdAt,
      updatedAt: mockTodo.updatedAt,
      completed: false,
    });
  });
});