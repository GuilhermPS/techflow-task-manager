import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NotFoundError, TaskStore, ValidationError } from './taskStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultPublicDir = path.join(__dirname, 'public');
const defaultDataFile = path.join(process.cwd(), 'data', 'tasks.json');

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8']
]);

export function createApp(options = {}) {
  const store = options.store || new TaskStore(options.dataFile || process.env.TASKFLOW_DATA_FILE || defaultDataFile);
  const publicDir = path.resolve(options.publicDir || defaultPublicDir);

  return async function app(request, response) {
    try {
      const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

      if (url.pathname === '/health' && request.method === 'GET') {
        return sendJson(response, 200, { status: 'ok' });
      }

      if (url.pathname === '/api/tasks' && request.method === 'GET') {
        const status = url.searchParams.get('status');
        const priority = url.searchParams.get('priority');
        const query = (url.searchParams.get('q') || '').toLowerCase();
        let tasks = await store.list();

        // Filtros usados pela interface para simular a visualização de um quadro Kanban.
        if (status && status !== 'all') {
          tasks = tasks.filter((task) => task.status === status);
        }

        if (priority && priority !== 'all') {
          tasks = tasks.filter((task) => task.priority === priority);
        }

        if (query) {
          tasks = tasks.filter((task) => {
            return [task.title, task.description, task.assignee]
              .join(' ')
              .toLowerCase()
              .includes(query);
          });
        }

        return sendJson(response, 200, { tasks });
      }

      if (url.pathname === '/api/tasks' && request.method === 'POST') {
        const input = await readJson(request);
        const task = await store.create(input);

        return sendJson(response, 201, { task });
      }

      const taskRoute = url.pathname.match(/^\/api\/tasks\/([^/]+)$/);

      if (taskRoute && request.method === 'PUT') {
        const input = await readJson(request);
        const task = await store.update(taskRoute[1], input);

        return sendJson(response, 200, { task });
      }

      if (taskRoute && request.method === 'DELETE') {
        await store.remove(taskRoute[1]);
        response.writeHead(204);
        return response.end();
      }

      if (url.pathname.startsWith('/api/')) {
        return sendJson(response, 404, { error: 'Rota da API não encontrada.' });
      }

      return serveStatic(publicDir, url.pathname, response);
    } catch (error) {
      return handleError(error, response);
    }
  };
}

export function startServer(options = {}) {
  const port = Number(options.port || process.env.PORT || 3000);
  const server = createServer(createApp(options));

  server.listen(port, () => {
    console.log(`TechFlow Task Manager em http://localhost:${port}`);
  });

  return server;
}

async function serveStatic(publicDir, requestedPath, response) {
  const pathname = requestedPath === '/' ? '/index.html' : requestedPath;
  const filePath = path.resolve(publicDir, `.${decodeURIComponent(pathname)}`);

  // Impede acesso a arquivos fora da pasta pública da aplicação.
  if (!filePath.startsWith(publicDir)) {
    return sendJson(response, 403, { error: 'Acesso negado.' });
  }

  try {
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      return sendJson(response, 404, { error: 'Arquivo não encontrado.' });
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return sendJson(response, 404, { error: 'Arquivo não encontrado.' });
    }

    throw error;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    'Content-Type': contentTypes.get(extension) || 'application/octet-stream'
  });
  createReadStream(filePath).pipe(response);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        request.destroy();
        reject(new ValidationError([{ field: 'body', message: 'Payload muito grande.' }]));
      }
    });

    request.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new ValidationError([{ field: 'body', message: 'JSON inválido.' }]));
      }
    });

    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(payload));
}

function handleError(error, response) {
  if (error instanceof ValidationError) {
    return sendJson(response, 400, {
      error: error.message,
      details: error.errors
    });
  }

  if (error instanceof NotFoundError) {
    return sendJson(response, 404, { error: error.message });
  }

  console.error(error);
  return sendJson(response, 500, { error: 'Erro interno do servidor.' });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
