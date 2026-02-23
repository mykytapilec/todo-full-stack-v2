import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoRepository, FilterTodosPayload } from '../repositories/todoRepository';
import { TodoService } from './todoService';
import { ok, err } from 'neverthrow';
import { createNotFoundError, createDatabaseError } from '../types/errors';
import { CreateTodoRequest } from '@shared/types/api';
import { Todo } from '../types/todo';

describe('TodoService', () => {
  let mockRepo: TodoRepository;
  let todoService: TodoService;

  const sampleTodos: Todo[] = [
    {
      id: 'test-id-1',
      title: 'Test Todo',
      description: 'Test Description',
      status: 'pending',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 'test-id-2',
      title: 'Test Todo 2',
      description: 'Test Description 2',
      status: 'completed',
      completionMessage: 'Task completed successfully',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      filter: vi.fn(),
      restore: vi.fn(),
    } as unknown as TodoRepository;

    todoService = new TodoService(mockRepo);
  });

  // ---------------- getAllTodos ----------------
  it('getAllTodos should return all todos', async () => {
    (mockRepo.findAll as any).mockResolvedValue(ok(sampleTodos));

    const result = await todoService.getAllTodos();
    expect(result).toEqual(ok(sampleTodos));
  });

  it('getAllTodos should return error if repository fails', async () => {
    const error = createDatabaseError('DB fail');
    (mockRepo.findAll as any).mockResolvedValue(err(error));

    const result = await todoService.getAllTodos();
    expect(result).toEqual(err(error));
  });

  // ---------------- getTodoById ----------------
  it('getTodoById should return todo if found', async () => {
    (mockRepo.findById as any).mockResolvedValue(ok(sampleTodos[0]));

    const result = await todoService.getTodoById('test-id-1');
    expect(result).toEqual(ok(sampleTodos[0]));
  });

  it('getTodoById should return NotFoundError if not found', async () => {
    const error = createNotFoundError('Todo', 'wrong-id');
    (mockRepo.findById as any).mockResolvedValue(err(error));

    const result = await todoService.getTodoById('wrong-id');
    expect(result).toEqual(err(error));
  });

  // ---------------- createTodo ----------------
  it('createTodo should create a new todo', async () => {
    const createData: CreateTodoRequest = { title: 'New', description: 'Desc' };
    const newTodo: Todo = { ...createData, id: 'new-id', status: 'pending', createdAt: new Date(), updatedAt: new Date() };
    (mockRepo.create as any).mockResolvedValue(ok(newTodo));

    const result = await todoService.createTodo(createData);
    expect(result).toEqual(ok(newTodo));
  });

  it('createTodo should return error if repository fails', async () => {
    const createData: CreateTodoRequest = { title: 'New' };
    const error = createDatabaseError('DB fail');
    (mockRepo.create as any).mockResolvedValue(err(error));

    const result = await todoService.createTodo(createData);
    expect(result).toEqual(err(error));
  });

  // ---------------- updateTodo ----------------
  it('updateTodo should update existing todo', async () => {
    const updates = { title: 'Updated' };
    const updatedTodo = { ...sampleTodos[0], ...updates, updatedAt: new Date() };
    (mockRepo.update as any).mockResolvedValue(ok(updatedTodo));

    const result = await todoService.updateTodo('test-id-1', updates);
    expect(result).toEqual(ok(updatedTodo));
  });

  it('updateTodo should return NotFoundError if todo not found', async () => {
    const updates = { title: 'Updated' };
    const error = createNotFoundError('Todo', 'wrong-id');
    (mockRepo.update as any).mockResolvedValue(err(error));

    const result = await todoService.updateTodo('wrong-id', updates);
    expect(result).toEqual(err(error));
  });

  // ---------------- deleteTodo ----------------
  it('deleteTodo should return Ok if deleted', async () => {
    (mockRepo.delete as any).mockResolvedValue(ok(undefined));

    const result = await todoService.deleteTodo('test-id-1');
    expect(result).toEqual(ok(undefined));
  });

  it('deleteTodo should return NotFoundError if todo not found', async () => {
    const error = createNotFoundError('Todo', 'wrong-id');
    (mockRepo.delete as any).mockResolvedValue(err(error));

    const result = await todoService.deleteTodo('wrong-id');
    expect(result).toEqual(err(error));
  });

  // ---------------- restoreTodo ----------------
  it('restoreTodo should return Ok if restored', async () => {
    (mockRepo.restore as any).mockResolvedValue(ok(undefined));

    const result = await todoService.restoreTodo('test-id-1');
    expect(result).toEqual(ok(undefined));
  });

  it('restoreTodo should return NotFoundError if todo not found', async () => {
    const error = createNotFoundError('Todo', 'wrong-id');
    (mockRepo.restore as any).mockResolvedValue(err(error));

    const result = await todoService.restoreTodo('wrong-id');
    expect(result).toEqual(err(error));
  });

  // ---------------- filter ----------------
  it('filter should return only completed todos', async () => {
    const payload: FilterTodosPayload = { status: 'completed' };
    const completedTodos = sampleTodos.filter(t => t.status === 'completed');
    (mockRepo.filter as any).mockResolvedValue(ok(completedTodos));

    const result = await todoService.filter(payload);
    expect(result).toEqual(ok(completedTodos));
  });

  it('filter should return only pending todos', async () => {
    const payload: FilterTodosPayload = { status: 'pending' };
    const pendingTodos = sampleTodos.filter(t => t.status === 'pending');
    (mockRepo.filter as any).mockResolvedValue(ok(pendingTodos));

    const result = await todoService.filter(payload);
    expect(result).toEqual(ok(pendingTodos));
  });

  it('filter should return all todos when status not specified', async () => {
    const payload: FilterTodosPayload = {};
    (mockRepo.filter as any).mockResolvedValue(ok(sampleTodos));

    const result = await todoService.filter(payload);
    expect(result).toEqual(ok(sampleTodos));
  });

  it('filter should return error when repository fails', async () => {
    const payload: FilterTodosPayload = { status: 'completed' };
    const error = createDatabaseError('Failed to filter todos');
    (mockRepo.filter as any).mockResolvedValue(err(error));

    const result = await todoService.filter(payload);
    expect(result).toEqual(err(error));
  });
});