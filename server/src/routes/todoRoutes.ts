import { Router } from 'express';
import { TodoController } from '../controllers/todoController';

export const createTodoRoutes = (controller: TodoController) => {
  const router = Router();

  router.post('/filter', controller.filterTodos);

  router.get('/deleted', controller.getDeletedTodos);
  router.post('/:id/restore', controller.restoreTodo);

  router.get('/', controller.getAllTodos);
  router.post('/', controller.createTodo);
  router.get('/:id', controller.getTodoById);
  router.put('/:id', controller.updateTodo);
  router.delete('/:id', controller.deleteTodo);

  return router;
};