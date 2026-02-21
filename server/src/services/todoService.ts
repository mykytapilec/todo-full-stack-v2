import { err, ok, Result } from 'neverthrow';
import { TodoRepository } from '../repositories/todoRepository';
import { Todo, InternalUpdateTodoRequest } from '../types/todo';
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

  /**
   * deleteTodo
   */
  async deleteTodo(id: string): Promise<Result<void, AppError>> {
    const result = await this.repo.delete(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  }

  async filter(payload: {
    completed?: boolean | string;
    query?: string;
  }): Promise<Result<Todo[], AppError>> {
    const normalizedCompleted =
      typeof payload.completed === 'string'
        ? payload.completed === 'true'
        : payload.completed;

    return this.repo.filter({
      completed: normalizedCompleted,
      query: payload.query,
    });
  }

    async getDeletedTodos(): Promise<Result<Todo[], AppError>> {
    return this.repo.findDeleted();
  }

  async restoreTodo(id: string): Promise<Result<void, AppError>> {
    const result = await this.repo.restore(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  }
}
