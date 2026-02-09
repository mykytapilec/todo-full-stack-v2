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
   * deleteTodo:
   * - OK → todo переведён в status=deleted
   * - NOT_FOUND → todo не существует или уже deleted
   */
  async deleteTodo(id: string): Promise<Result<void, AppError>> {
    const result = await this.repo.delete(id);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  }

  async filter(payload: {
    query?: string;
    status?: 'pending' | 'completed';
  }): Promise<Result<Todo[], AppError>> {
    return this.repo.filter(payload);
  }
}
