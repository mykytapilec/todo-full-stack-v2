import { Collection, Db, Filter } from 'mongodb';
import { Result, ok, err } from 'neverthrow';
import { randomUUID } from 'crypto';
import {
  Todo,
  InternalUpdateTodoRequest,
  TodoStatus,
} from '../types/todo';
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
  | (TodoDocumentBase & {
      status: 'completed';
      completionMessage: string;
    })
  | (TodoDocumentBase & { status: 'deleted' });

export type FilterTodosPayload = {
  query?: string;
  status?: TodoStatus;
};

export class TodoRepository {
  private collection: Collection<TodoDocument>;

  constructor(db: Db) {
    this.collection = db.collection<TodoDocument>('todos');
  }

  private documentToTodo(doc: TodoDocument): Todo {
    const todo: Todo = {
      id: doc.id,
      title: doc.title,
      status: doc.status as Exclude<TodoStatus, 'deleted'>,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    if (doc.description) {
      todo.description = doc.description;
    }

    if (doc.status === 'completed') {
      todo.completionMessage = doc.completionMessage;
    }

    return todo;
  }

  async findAll(): Promise<Result<Todo[], AppError>> {
    try {
      const docs = await this.collection
        .find({ status: { $ne: 'deleted' } })
        .sort({ createdAt: -1 })
        .toArray();

      return ok(docs.map((d) => this.documentToTodo(d)));
    } catch (error) {
      return err(createDatabaseError('Failed to retrieve todos', error));
    }
  }

  async findById(id: string): Promise<Result<Todo, AppError>> {
    try {
      const doc = await this.collection.findOne({
        id,
        status: { $ne: 'deleted' },
      });

      if (!doc) {
        return err(createNotFoundError('Todo', id));
      }

      return ok(this.documentToTodo(doc));
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
        ...(todoData.description && { description: todoData.description }),
      };

      await this.collection.insertOne(doc);

      return ok(this.documentToTodo(doc));
    } catch (error) {
      return err(createDatabaseError('Failed to create todo', error));
    }
  }

  async update(
    id: string,
    updates: InternalUpdateTodoRequest
  ): Promise<Result<Todo, AppError>> {
    try {
      const now = new Date();

      const setFields: Partial<TodoDocument> & { updatedAt: Date } = {
        updatedAt: now,
      };

      const unsetFields: Record<string, ''> = {};

      if (updates.title !== undefined) {
        setFields.title = updates.title;
      }

      if (updates.description !== undefined) {
        setFields.description = updates.description;
      }

      if (updates.status !== undefined) {
        setFields.status = updates.status;

        if (updates.status === 'completed') {
          if (!updates.completionMessage) {
            return err(
              createDatabaseError(
                'Completion message required when marking as completed'
              )
            );
          }

          (setFields as any).completionMessage =
            updates.completionMessage;
        }

        if (updates.status === 'pending') {
          unsetFields.completionMessage = '';
        }
      }

      const updateQuery: any = { $set: setFields };

      if (Object.keys(unsetFields).length > 0) {
        updateQuery.$unset = unsetFields;
      }

      const result = await this.collection.findOneAndUpdate(
        { id, status: { $ne: 'deleted' } },
        updateQuery,
        { returnDocument: 'after' }
      );

      if (!result) {
        return err(createNotFoundError('Todo', id));
      }

      return ok(this.documentToTodo(result));
    } catch (error) {
      return err(createDatabaseError('Failed to update todo', error));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      const result = await this.collection.updateOne(
        { id, status: { $ne: 'deleted' } },
        { $set: { status: 'deleted', updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return err(createNotFoundError('Todo', id));
      }

      return ok(undefined);
    } catch (error) {
      return err(createDatabaseError('Failed to delete todo', error));
    }
  }

  async filter(payload: FilterTodosPayload): Promise<Result<Todo[], AppError>> {
    try {
      const filter: Filter<TodoDocument> = {};

      if (payload.status) {
        filter.status = payload.status;
      } else {
        filter.status = { $ne: 'deleted' };
      }

      if (payload.query) {
        filter.$or = [
          { title: { $regex: payload.query, $options: 'i' } },
          { description: { $regex: payload.query, $options: 'i' } },
        ];
      }

      const docs = await this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();

      return ok(docs.map((d) => this.documentToTodo(d)));
    } catch (error) {
      return err(createDatabaseError('Failed to filter todos', error));
    }
  }

  async restore(id: string): Promise<Result<void, AppError>> {
    try {
      const result = await this.collection.updateOne(
        { id, status: 'deleted' },
        {
          $set: {
            status: 'pending',
            updatedAt: new Date(),
          },
          $unset: {
            completionMessage: '',
          },
        }
      );

      if (result.matchedCount === 0) {
        return err(createNotFoundError('Todo', id));
      }

      return ok(undefined);
    } catch (error) {
      return err(createDatabaseError('Failed to restore todo', error));
    }
  }
}