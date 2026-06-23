import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { NotFoundError, TaskStore, ValidationError } from '../src/taskStore.js';

test('cria, lista, atualiza e remove tarefas', async () => {
  const context = await createStoreContext();

  try {
    const created = await context.store.create({
      title: 'Mapear fluxo de entregas',
      description: 'Levantar etapas usadas pela startup de logística',
      assignee: 'Ana',
      dueDate: '2026-06-30',
      priority: 'critica'
    });

    assert.equal(created.status, 'todo');
    assert.equal(created.assignee, 'Ana');
    assert.equal(created.priority, 'critica');

    const updated = await context.store.update(created.id, { status: 'in-progress' });
    assert.equal(updated.status, 'in-progress');

    const tasks = await context.store.list();
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].title, 'Mapear fluxo de entregas');

    await context.store.remove(created.id);
    assert.deepEqual(await context.store.list(), []);
  } finally {
    await context.cleanup();
  }
});

test('valida título obrigatório e status aceito', async () => {
  const context = await createStoreContext();

  try {
    await assert.rejects(
      () => context.store.create({ title: '', status: 'blocked', priority: 'urgente' }),
      (error) => {
        assert.equal(error instanceof ValidationError, true);
        assert.equal(error.errors.length, 3);
        return true;
      }
    );
  } finally {
    await context.cleanup();
  }
});

test('informa erro ao atualizar tarefa inexistente', async () => {
  const context = await createStoreContext();

  try {
    await assert.rejects(
      () => context.store.update('tarefa-inexistente', { status: 'done' }),
      NotFoundError
    );
  } finally {
    await context.cleanup();
  }
});

async function createStoreContext() {
  const directory = await mkdtemp(path.join(tmpdir(), 'techflow-store-'));
  const store = new TaskStore(path.join(directory, 'tasks.json'));

  return {
    store,
    cleanup: () => rm(directory, { recursive: true, force: true })
  };
}
