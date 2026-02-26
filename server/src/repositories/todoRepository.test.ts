import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { ok } from 'neverthrow';
import { TodoRepository } from './todoRepository';

describe('TodoRepository Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let directDb: Db;
  let directClient: MongoClient;
  let repository: TodoRepository;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const dbName = `test-${Date.now()}`;

    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db(dbName);
    repository = new TodoRepository(db);

    directClient = new MongoClient(mongoUri);
    await directClient.connect();
    directDb = directClient.db(dbName);
  });

  afterEach(async () => {
    await client.close();
    await directClient.close();
    await mongoServer.stop();
  });

  describe('Soft Deletion Functionality', () => {
    it('should soft delete a todo by setting status to deleted', async () => {
      await directDb.collection('todos').insertOne({
        schemaVersion: 1,
        id: 'test-todo-1',
        title: 'Test Todo',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.delete('test-todo-1');

      expect(result).toMatchObject(ok(undefined));

      const deletedTodo = await directDb
        .collection('todos')
        .findOne({ id: 'test-todo-1' });

      expect(deletedTodo?.['status']).toBe('deleted');
      expect(deletedTodo?.['updatedAt']).toBeInstanceOf(Date);
    });
  });

  describe('Database Consistency', () => {
    it('should maintain referential integrity after soft deletion', async () => {
      const createResult = await repository.create({
        title: 'Test Todo for Deletion',
        description: 'Will be deleted',
      });

      expect(createResult.isOk()).toBe(true);

      if (createResult.isOk()) {
        const todoId = createResult.value.id;

        const deleteResult = await repository.delete(todoId);

        expect(deleteResult).toMatchObject(ok(undefined));

        const dbTodo = await directDb
          .collection('todos')
          .findOne({ id: todoId });

        expect(dbTodo?.['status']).toBe('deleted');

        const findResult = await repository.findById(todoId);
        expect(findResult.isErr()).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should properly handle todos with undefined description after deletion', async () => {
      await directDb.collection('todos').insertOne({
        schemaVersion: 1,
        id: 'no-desc-todo',
        title: 'Todo without description',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const deleteResult = await repository.delete('no-desc-todo');

      expect(deleteResult).toMatchObject(ok(undefined));

      const dbTodo = await directDb
        .collection('todos')
        .findOne({ id: 'no-desc-todo' });

      expect(dbTodo?.['status']).toBe('deleted');
      expect(dbTodo?.['description']).toBeUndefined();
    });
  });
});