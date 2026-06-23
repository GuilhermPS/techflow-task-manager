import { createServer } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/server.js';
import { TaskStore } from '../src/taskStore.js';

test('API permite criar, filtrar, atualizar e excluir tarefa', async () => {
  const context = await createApiContext();

  try {
    const created = await context.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Criar backlog inicial',
        assignee: 'Bruno',
        priority: 'alta'
      })
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.task.status, 'todo');
    assert.equal(created.body.task.priority, 'alta');

    const filtered = await context.request('/api/tasks?status=todo&priority=alta');
    assert.equal(filtered.status, 200);
    assert.equal(filtered.body.tasks.length, 1);

    const updated = await context.request(`/api/tasks/${created.body.task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'done' })
    });

    assert.equal(updated.body.task.status, 'done');

    const removed = await context.request(`/api/tasks/${created.body.task.id}`, {
      method: 'DELETE'
    });

    assert.equal(removed.status, 204);

    const allTasks = await context.request('/api/tasks');
    assert.equal(allTasks.body.tasks.length, 0);
  } finally {
    await context.cleanup();
  }
});

test('API retorna erro 400 para payload inválido', async () => {
  const context = await createApiContext();

  try {
    const response = await context.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: '' })
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.details[0].field, 'title');
  } finally {
    await context.cleanup();
  }
});

async function createApiContext() {
  const directory = await mkdtemp(path.join(tmpdir(), 'techflow-api-'));
  const store = new TaskStore(path.join(directory, 'tasks.json'));
  const server = createServer(createApp({ store, publicDir: path.join(process.cwd(), 'src', 'public') }));

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  return {
    request: async (url, options = {}) => {
      const response = await fetch(`http://127.0.0.1:${port}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (response.status === 204) {
        return { status: response.status, body: null };
      }

      return {
        status: response.status,
        body: await response.json()
      };
    },
    cleanup: async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await rm(directory, { recursive: true, force: true });
    }
  };
}
