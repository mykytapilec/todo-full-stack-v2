import { Collection, Db, WithId } from 'mongodb';
import { Result, ok, err } from 'neverthrow';
import { randomUUID } from 'crypto';
import { Todo, InternalUpdateTodoRequest } from '../types/todo';
import { CreateTodoRequest } from '@shared/types/api';
import {
  AppError,
  createDatabaseError,
  createNotFoundError,
} from '../types/errors';

type TodoDocumentBase = {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

type TodoDocument =
  | (TodoDocumentBase & { status: 'pending' })
  | (TodoDocumentBase & { status: 'completed'; completionMessage: string })
  | (TodoDocumentBase & { status: 'deleted' });

export type FilterTodosPayload = {
  query?: string;
  completed?: boolean;
};

export class TodoRepository {
  private collection: Collection<TodoDocument>;

  constructor(db: Db) {
    this.collection = db.collection<TodoDocument>('todos');
  }

  private baseFilter() {
    return { status: { $ne: 'deleted' } as const };
  }

  private documentToTodo(doc: WithId<TodoDocument>): Todo {
    const baseTodo: Todo = {
      id: doc.id,
      title: doc.title,
      status: doc.status === 'deleted' ? 'pending' : doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    if (doc.description) baseTodo.description = doc.description;
    if (doc.status === 'completed' && 'completionMessage' in doc)
      baseTodo.completionMessage = doc.completionMessage;

    return baseTodo;
  }

  async findAll(): Promise<Result<Todo[], AppError>> {
    try {
      const docs = await this.collection.find(this.baseFilter() as any).sort({ createdAt: -1 }).toArray();
      return ok(docs.map((d) => this.documentToTodo(d)));
    } catch (error) {
      return err(createDatabaseError('Failed to retrieve todos', error));
    }
  }

  async findById(id: string): Promise<Result<Todo, AppError>> {
    try {
      const doc = await this.collection.findOne({ ...this.baseFilter(), id } as any);
      if (!doc) return err(createNotFoundError('Todo', id));
      return ok(this.documentToTodo(doc as WithId<TodoDocument>));
    } catch (error) {
      return err(createDatabaseError('Failed to retrieve todo', error));
    }
  }

  async create(todoData: CreateTodoRequest): Promise<Result<Todo, AppError>> {
    try {
      const now = new Date();
      const doc: TodoDocument = {
        schemaVersion: 1,
        id: randomUUID(),
        title: todoData.title,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      if (todoData.description) doc.description = todoData.description;

      await this.collection.insertOne(doc);
      return ok(this.documentToTodo(doc as WithId<TodoDocument>));
    } catch (error) {
      return err(createDatabaseError('Failed to create todo', error));
    }
  }

  async update(
    id: string,
    updates: InternalUpdateTodoRequest
  ): Promise<Result<Todo, AppError>> {
    try {
      const updateDoc: Partial<TodoDocument> & { updatedAt: Date } = { updatedAt: new Date() };
      if (updates.title !== undefined) updateDoc.title = updates.title;
      if (updates.description !== undefined) updateDoc.description = updates.description;
      if (updates.status !== undefined) {
        updateDoc.status = updates.status;
        if (updates.status === 'completed' && updates.completionMessage)
          (updateDoc as any).completionMessage = updates.completionMessage;
      }

      const updateQuery: any = { $set: updateDoc };
      if (updates.status === 'pending') updateQuery.$unset = { completionMessage: '' };

      const result = await this.collection.findOneAndUpdate(
        { ...this.baseFilter(), id } as any,
        updateQuery,
        { returnDocument: 'after' }
      ) as unknown as { value: WithId<TodoDocument> | null };

      if (!result.value) return err(createNotFoundError('Todo', id));
      return ok(this.documentToTodo(result.value));
    } catch (error) {
      return err(createDatabaseError('Failed to update todo', error));
    }
  }

  async delete(id: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.collection.findOneAndUpdate(
        { ...this.baseFilter(), id } as any,
        { $set: { status: 'deleted', updatedAt: new Date() } },
        { returnDocument: 'after' }
      ) as unknown as { value: WithId<TodoDocument> | null };

      if (!result.value) return err(createNotFoundError('Todo', id));
      return ok(true);
    } catch (error) {
      return err(createDatabaseError('Failed to delete todo', error));
    }
  }

  async filter(payload: FilterTodosPayload): Promise<Result<Todo[], AppError>> {
    try {
      const filter: any = this.baseFilter();
      if (payload.completed === true) filter.status = 'completed';
      if (payload.completed === false) filter.status = 'pending';
      if (payload.query) filter.$or = [
        { title: { $regex: payload.query, $options: 'i' } },
        { description: { $regex: payload.query, $options: 'i' } },
      ];

      const docs = await this.collection.find(filter).sort({ createdAt: -1 }).toArray();
      return ok(docs.map((d) => this.documentToTodo(d)));
    } catch (error) {
      return err(createDatabaseError('Failed to filter todos', error));
    }
  }
}
