import { err, ok, Result } from 'neverthrow';
import { TodoRepository } from '../repositories/todoRepository';
import { Todo, InternalUpdateTodoRequest, TodoStatus } from '../types/todo';
import { CreateTodoRequest } from '@shared/types/api';
import { AppError } from '../types/errors';

export class TodoService {
  constructor(private repo: TodoRepository) {}

  async getAllTodos(): Promise<Result<Todo[], AppError>> {
    return this.repo.findAll();
  }

  async getTodoById(id: string): Promise<Result<Todo, AppError>> {
    return this.repo.findById(id);
  }

  async createTodo(payload: CreateTodoRequest): Promise<Result<Todo, AppError>> {
    return this.repo.create(payload);
  }

  async updateTodo(
    id: string,
    updates: InternalUpdateTodoRequest
  ): Promise<Result<Todo, AppError>> {
    return this.repo.update(id, updates);
  }

  async deleteTodo(id: string): Promise<Result<void, AppError>> {
    const result = await this.repo.delete(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  }

  async restoreTodo(id: string): Promise<Result<void, AppError>> {
    const result = await this.repo.restore(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  }

  async getDeletedTodos(): Promise<Result<Todo[], AppError>> {
    return this.repo.findDeleted();
  }

  async filter(payload: {
    status?: Exclude<TodoStatus, 'deleted'> | string;
    query?: string;
  }): Promise<Result<Todo[], AppError>> {
    const normalizedStatus =
      typeof payload.status === 'string'
        ? payload.status === 'completed'
          ? 'completed'
          : payload.status === 'pending'
          ? 'pending'
          : undefined
        : payload.status;

    return this.repo.filter({
      status: normalizedStatus,
      query: payload.query,
    });
  }
}