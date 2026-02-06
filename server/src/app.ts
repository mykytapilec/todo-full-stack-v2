import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as OpenApiValidator from 'express-openapi-validator';
import { Server } from 'http';
import swaggerUi from 'swagger-ui-express';
import { Database } from './config/database';
import { createTodoRoutes } from './routes/todoRoutes';
import { TodoController } from './controllers/todoController';
import { TodoService } from './services/todoService';
import { TodoRepository } from './repositories/todoRepository';
import apiDocs from './openapi.json';

export class TodoApplication {
  private app: Express;
  private server?: Server;
  private database: Database;

  constructor() {
    this.app = express();
    this.database = Database.getInstance();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(
      cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      })
    );

    this.app.use(express.json());
console.log('🔥 OPENAPI PATH =', apiDocs);

    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: apiDocs as any,
        validateRequests: {
          allowUnknownQueryParameters: false,
          coerceTypes: true,
          removeAdditional: true,
        },
        validateResponses: {
          coerceTypes: true,
          removeAdditional: true,
        },
        ignorePaths: /.*\/api-docs.*/,
        // basePath: '/api', // ключевой момент: указываем префикс /api
      })
    );
  }

  private setupRoutes(): void {
    // Инициализация зависимостей
    const todoRepository = new TodoRepository(this.database.getDb());
    const todoService = new TodoService(todoRepository);
    const todoController = new TodoController(todoService);

    const todoRoutes = createTodoRoutes(todoController);

    this.app.use('/api/todos', todoRoutes);

    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(apiDocs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Todo API Documentation',
        swaggerOptions: {
          persistAuthorization: true,
        },
      })
    );

    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    this.app.use('*', (_req: Request, res: Response) => {
      res.status(404).json({ message: 'not found' });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(
      (err: any, _req: Request, res: Response, next: NextFunction) => {
        if (err.status && err.status >= 400 && err.status < 500) {
          res.status(err.status).json({
            message: err.message,
            errors: err.errors || [],
          });
          return;
        }
        next(err);
      }
    );

    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
    });
  }

  public async initialize(): Promise<void> {
    await this.database.connect(
      process.env['MONGO_URI'] || 'mongodb://localhost:27017/todoapp'
    );
    this.setupRoutes();
    this.setupErrorHandling();
  }

  public getApp(): Express {
    return this.app;
  }

  public async start(port: number = 3000): Promise<Server> {
    if (!this.database.isConnected()) {
      await this.initialize();
    }
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          resolve(this.server!);
        });
        this.server.on('error', (error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}
