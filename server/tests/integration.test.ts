import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { TodoApplication } from '../src/app';

describe('Todo API integration', () => {
  let application: TodoApplication;
  let app: any;
  let createdId: string;

  beforeAll(async () => {
    application = new TodoApplication();
    await application.initialize();
    app = application.getApp();
  });

  afterAll(async () => {
    await application.stop();
  });

  it('POST /api/todos -> should create todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({
        title: 'Integration Test Todo',
        description: 'Test description'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Integration Test Todo');
    expect(res.body.completed).toBe(false);

    createdId = res.body.id;
  });

  it('GET /api/todos -> should return list including created todo', async () => {
    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const found = res.body.find((t: any) => t.id === createdId);
    expect(found).toBeDefined();
  });

  it('GET /api/todos/:id -> should return single todo', async () => {
    const res = await request(app).get(`/api/todos/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  it('PUT /api/todos/:id -> should update todo', async () => {
    const res = await request(app)
      .put(`/api/todos/${createdId}`)
      .send({
        completed: true,
        completionMessage: 'Done!'
      });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.completionMessage).toBe('Done!');
  });

  it('DELETE /api/todos/:id -> should soft delete todo', async () => {
    const res = await request(app).delete(`/api/todos/${createdId}`);

    expect(res.status).toBe(204);
  });

  it('POST /api/todos/:id/restore -> should restore todo', async () => {
    const res = await request(app).post(
      `/api/todos/${createdId}/restore`
    );

    expect(res.status).toBe(204);
  });

  it('GET /api/todos/:id with wrong id -> should return 404', async () => {
    const res = await request(app).get('/api/todos/non-existing-id');

    expect(res.status).toBe(404);
  });
});