export type TodoBase = {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Todo =
  | (TodoBase & {
      status: 'pending';
    })
  | (TodoBase & {
      status: 'completed';
      completionMessage: string;
    });


export type CreateTodoRequest = {
  title: string;
  description?: string;
};

export type UpdateTodoRequest = {
  title?: string;
  description?: string;
  completed?: boolean;
  completionMessage?: string;
};


export type TodoStatus = 'pending' | 'completed' | 'deleted';

export type InternalUpdateTodoRequest = {
  title?: string;
  description?: string;
  status?: TodoStatus;
  completionMessage?: string;
};

