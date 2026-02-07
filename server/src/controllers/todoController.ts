import { Request, Response } from 'express';
import { TodoService } from '../services/todoService';
import { CreateTodoRequest, UpdateTodoRequest, ApiTodo } from '@shared/types/api';
import { InternalUpdateTodoRequest, Todo } from '../types/todo';

export class TodoController {
  constructor(private todoService: TodoService) {}

  private todoToApiTodo(todo: Todo): ApiTodo {
    const apiTodo: ApiTodo = {
      id: todo.id,
      title: todo.title,
      completed: todo.status === 'completed',
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
    if (todo.description) apiTodo.description = todo.description;
    if (todo.status === 'completed' && todo.completionMessage)
      apiTodo.completionMessage = todo.completionMessage;
    return apiTodo;
  }

  private todosToApiTodos(todos: Todo[]): ApiTodo[] {
    return todos.map((t) => this.todoToApiTodo(t));
  }

  filterTodos = async (req: Request, res: Response) => {
    const { completed, search } = req.body ?? {};
    const result = await this.todoService.filter({
      status: completed === undefined ? undefined : completed ? 'completed' : 'pending',
      query: search,
    });
    if (result.isErr()) return res.status(500).json({ error: result.error.message });
    res.status(200).json(this.todosToApiTodos(result.value));
  };

  getAllTodos = async (_req: Request, res: Response) => {
    const result = await this.todoService.getAllTodos();
    if (result.isOk()) res.json(this.todosToApiTodos(result.value));
    else res.status(500).json({ error: result.error });
  };

  getTodoById = async (req: Request, res: Response) => {
    const result = await this.todoService.getTodoById(req.params.id!);
    if (result.isOk()) res.json(this.todoToApiTodo(result.value));
    else res.status(404).json({ error: 'Todo not found' });
  };

  createTodo = async (req: Request, res: Response) => {
    const payload: CreateTodoRequest = req.body;
    const result = await this.todoService.createTodo(payload);
    if (result.isOk()) res.status(201).json(this.todoToApiTodo(result.value));
    else res.status(500).json({ error: result.error });
  };

  updateTodo = async (req: Request, res: Response) => {
    const payload: UpdateTodoRequest = req.body;
    const internal: InternalUpdateTodoRequest = {};
    if (payload.title) internal.title = payload.title;
    if (payload.description) internal.description = payload.description;
    if (payload.completed !== undefined) {
      internal.status = payload.completed ? 'completed' : 'pending';
      if (payload.completed && payload.completionMessage) internal.completionMessage = payload.completionMessage;
    }
    const result = await this.todoService.updateTodo(req.params.id!, internal);
    if (result.isOk()) res.status(200).json(this.todoToApiTodo(result.value));
    else res.status(500).json({ error: result.error });
  };

  deleteTodo = async (req: Request, res: Response) => {
    const result = await this.todoService.deleteTodo(req.params.id!);
    if (result.isOk()) res.status(204).send();
    else res.status(500).json({ error: result.error });
  };
}
