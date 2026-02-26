import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoController } from './todoController';
import { ok, err } from 'neverthrow';
import { Todo } from '../types/todo';

describe('TodoController', () => {
  let todoService: any;
  let controller: TodoController;
  let res: any;

  beforeEach(() => {
    todoService = {
      getAllTodos: vi.fn(),
      getTodoById: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
      restoreTodo: vi.fn(),
      filter: vi.fn(),
    };

    controller = new TodoController(todoService);

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
  });

  it('getAllTodos should return todos', async () => {
    const todos: Todo[] = [
      { id: '1', title: 'Test', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
    ];
    todoService.getAllTodos.mockResolvedValue(ok(todos));

    await controller.getAllTodos({} as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      todos.map(t => ({
        id: t.id,
        title: t.title,
        completed: false,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    );
  });

  it('getTodoById should return a single todo', async () => {
    const todo: Todo = { id: '1', title: 'Test', status: 'pending', createdAt: new Date(), updatedAt: new Date() };
    todoService.getTodoById.mockResolvedValue(ok(todo));

    const req = { params: { id: '1' } } as any;

    await controller.getTodoById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: todo.id,
      title: todo.title,
      completed: false,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    });
  });

  it('getTodoById should return 404 if not found', async () => {
    const req = { params: { id: 'non-existing' } } as any;
    todoService.getTodoById.mockResolvedValue(
      err({ type: 'NOT_FOUND', message: 'Todo not found' })
    );

    await controller.getTodoById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Todo not found' });
  });

  it('createTodo should create and return a todo', async () => {
    const todo: Todo = { id: '1', title: 'New', status: 'pending', createdAt: new Date(), updatedAt: new Date() };
    todoService.createTodo.mockResolvedValue(ok(todo));

    const req = { body: { title: 'New' } } as any;

    await controller.createTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: todo.id,
      title: todo.title,
      completed: false,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    });
  });
});