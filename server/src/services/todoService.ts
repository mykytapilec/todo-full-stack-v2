import { Result } from 'neverthrow';
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

  async updateTodo(id: string, updates: InternalUpdateTodoRequest): Promise<Result<Todo, AppError>> {
    return this.repo.update(id, updates);
  }

  async deleteTodo(id: string): Promise<Result<boolean, AppError>> {
    return this.repo.delete(id);
  }

  async filter(payload: { query?: string; status?: 'pending' | 'completed' }): Promise<Result<Todo[], AppError>> {
    return this.repo.filter(payload);
  }
}
