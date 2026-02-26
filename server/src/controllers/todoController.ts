import { Request, Response } from 'express';
import { TodoService } from '../services/todoService';
import {
  CreateTodoRequest,
  UpdateTodoRequest,
  ApiTodo,
} from '@shared/types/api';
import { InternalUpdateTodoRequest, Todo } from '../types/todo';

export class TodoController {
  constructor(private todoService: TodoService) {}

  /**
   * Domain → API adapter
   */
  private todoToApiTodo(todo: Todo): ApiTodo {
    const apiTodo: ApiTodo = {
      id: todo.id,
      title: todo.title,
      completed: todo.status === 'completed',
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };

    if (todo.description) {
      apiTodo.description = todo.description;
    }

    if (todo.status === 'completed' && todo.completionMessage) {
      apiTodo.completionMessage = todo.completionMessage;
    }

    return apiTodo;
  }

  private todosToApiTodos(todos: Todo[]): ApiTodo[] {
    return todos.map((todo) => this.todoToApiTodo(todo));
  }

  // GET /api/todos
  getAllTodos = async (_req: Request, res: Response) => {
    const result = await this.todoService.getAllTodos();

    if (result.isOk()) {
      return res.status(200).json(this.todosToApiTodos(result.value));
    }

    return res.status(500).json({ error: result.error.message });
  };

getTodoById = async (req: Request, res: Response) => {
  const result = await this.todoService.getTodoById(req.params.id);

  result.match(
    (todo) => res.status(200).json(this.todoToApiTodo(todo)),
    (error) => {
      if (error.type === 'NOT_FOUND') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  );
};

  // POST /api/todos/filter
  filterTodos = async (req: Request, res: Response) => {
    const { status, query } = req.body ?? {};

    const result = await this.todoService.filter({
      status,
      query,
    });

    if (result.isOk()) {
      return res.status(200).json(this.todosToApiTodos(result.value));
    }

    return res.status(500).json({ error: result.error.message });
  };

  // POST /api/todos
  createTodo = async (req: Request, res: Response) => {
    const payload: CreateTodoRequest = req.body;

    const result = await this.todoService.createTodo(payload);

    if (result.isOk()) {
      return res.status(201).json(this.todoToApiTodo(result.value));
    }

    return res.status(500).json({ error: result.error.message });
  };

  // PUT /api/todos/:id
  updateTodo = async (req: Request, res: Response) => {
    const payload: UpdateTodoRequest = req.body;

    const internal: InternalUpdateTodoRequest = {};

    if (payload.title !== undefined) {
      internal.title = payload.title;
    }

    if (payload.description !== undefined) {
      internal.description = payload.description;
    }

    if (payload.completed !== undefined) {
      internal.status = payload.completed ? 'completed' : 'pending';

      if (payload.completed && payload.completionMessage) {
        internal.completionMessage = payload.completionMessage;
      }
    }

    const result = await this.todoService.updateTodo(
      req.params.id,
      internal
    );

    if (result.isOk()) {
      return res.status(200).json(this.todoToApiTodo(result.value));
    }

    if (result.error.type === 'NOT_FOUND') {
      return res.status(404).send();
    }

    return res.status(500).json({ error: result.error.message });
  };

  // DELETE /api/todos/:id
  deleteTodo = async (req: Request, res: Response) => {
    const result = await this.todoService.deleteTodo(req.params.id);

    if (result.isOk()) {
      return res.status(204).send();
    }

    if (result.error.type === 'NOT_FOUND') {
      return res.status(404).send();
    }

    return res.status(500).json({ error: result.error.message });
  };

  // POST /api/todos/:id/restore
  restoreTodo = async (req: Request, res: Response) => {
    const result = await this.todoService.restoreTodo(req.params.id);

    if (result.isOk()) {
      return res.status(204).send();
    }

    if (result.error.type === 'NOT_FOUND') {
      return res.status(404).send();
    }

    return res.status(500).json({ error: result.error.message });
  };
}