export type Todo = {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  completionMessage?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InternalUpdateTodoRequest = Partial<{
  title: string;
  description: string;
  status: 'pending' | 'completed';
  completionMessage: string;
}>;

export type TodoDocumentBase = {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TodoDocument =
  | (TodoDocumentBase & { status: 'pending' })
  | (TodoDocumentBase & { status: 'completed'; completionMessage: string })
  | (TodoDocumentBase & { status: 'deleted' });
