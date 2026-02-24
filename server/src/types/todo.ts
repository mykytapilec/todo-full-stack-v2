export type TodoStatus = 'pending' | 'completed' | 'deleted';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: Exclude<TodoStatus, 'deleted'>;
  completionMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoDocument {
  _id?: any;
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  completionMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternalUpdateTodoRequest {
  title?: string;
  description?: string;
  status?: TodoStatus;
  completionMessage?: string;
}