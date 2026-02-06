import { Collection, Db } from 'mongodb';
import { Result, ok, err } from 'neverthrow';
import { randomUUID } from 'crypto';
import { Todo, InternalUpdateTodoRequest } from '../types/todo';
import { CreateTodoRequest } from '@shared/types/api';
import { AppError, createDatabaseError, createNotFoundError } from '../types/errors';

/**
 * Mongo document types
 */
type TodoDocumentBase = {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

type TodoDocument =
  | (TodoDocumentBase & {
      status: 'pending';
    })
  | (TodoDocumentBase & {
      status: 'completed';
      completionMessage: string;
    })
  | (TodoDocumentBase & {
      status: 'deleted';
    });

export type FilterTodosPayload = {
  query?: string;
  completed?: boolean;
};

export class TodoRepository {
  private collection: Collection<TodoDocument>;

  constructor(db: Db) {
    this.collection = db.collection<TodoDocument>('todos');
  }

  /**
   * Helpers
   */
  private baseFilter() {
    return { status: { $ne: 'deleted' as const } };
  }

  private documentToTodo(doc: TodoDocument): Todo {
    const baseTodo = {
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    if (doc.status === 'completed') {
      const todo: Todo = {
        ...baseTodo,
        status: 'completed',
        completionMessage: doc.completionMessage,
      };

      if (doc.description !== undefined) {
        todo.description = doc.description;
      }

      return todo;
    }

    // pending
    const todo: Todo = {
      ...baseTodo,
      status: 'pending',
    };

    if (doc.description !== undefined) {
      todo.description = doc.description;
    }

    return todo;
  }

  /**
   * Queries
   */
  async findAll(): Promise<Result<Todo[], AppError>> {
    try {
      const docs = await this.collection
        .find(this.baseFilter())
        .sort({ createdAt: -1 })
        .toArray();

      return ok(docs.map((d) => this.documentToTodo(d)));
    } catch (error) {
      return err(createDatabaseError('Failed to retrieve todos', error));
    }
  }

  async findById(id: string): Promise<Result<Todo, AppError>> {
    try {
      const doc = await this.collection.findOne({ ...this.baseFilter(), id });

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
      };

      if (todoData.description !== undefined) {
        doc.description = todoData.description;
      }

      await this.collection.insertOne(doc);

      return ok(this.documentToTodo(doc));
    } catch (error) {
      return err(createDatabaseError('Failed to create todo', error));
    }
  }

  async update(
    id: string,
    updates: InternalUpdateTodoRequest,
  ): Promise<Result<Todo, AppError>> {
    try {
      const updateDoc: any = {
        updatedAt: new Date(),
      };

      if (updates.title !== undefined) {
        updateDoc.title = updates.title;
      }

      if (updates.description !== undefined) {
        updateDoc.description = updates.description;
      }

      if (updates.status !== undefined) {
        updateDoc.status = updates.status;

        if (
          updates.status === 'completed' &&
          updates.completionMessage !== undefined
        ) {
          updateDoc.completionMessage = updates.completionMessage;
        }
      }

      const updateQuery: any = { $set: updateDoc };

      if (updates.status === 'pending') {
        updateQuery.$unset = { completionMessage: '' };
      }

      const result = await this.collection.findOneAndUpdate(
        { ...this.baseFilter(), id },
        updateQuery,
        { returnDocument: 'after' },
      );

      if (!result) {
        return err(createNotFoundError('Todo', id));
      }

      return ok(this.documentToTodo(result));
    } catch (error) {
      return err(createDatabaseError('Failed to update todo', error));
    }
  }

  async delete(id: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.collection.findOneAndUpdate(
        { ...this.baseFilter(), id },
        { $set: { status: 'deleted' as const, updatedAt: new Date() } },
      );

      if (!result) {
        return err(createNotFoundError('Todo', id));
      }

      return ok(true);
    } catch (error) {
      return err(createDatabaseError('Failed to delete todo', error));
    }
  }

  async filter(
    payload: FilterTodosPayload,
  ): Promise<Result<Todo[], AppError>> {
    try {
      const filter: any = this.baseFilter();

      if (payload.completed === true) {
        filter.status = 'completed';
      }

      if (payload.completed === false) {
        filter.status = 'pending';
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
}
