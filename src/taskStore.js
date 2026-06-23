import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const TASK_STATUSES = Object.freeze(['todo', 'in-progress', 'done']);
export const TASK_PRIORITIES = Object.freeze(['baixa', 'media', 'alta', 'critica']);

export class ValidationError extends Error {
  constructor(errors) {
    super('Dados da tarefa inválidos.');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(id) {
    super(`Tarefa ${id} não encontrada.`);
    this.name = 'NotFoundError';
    this.id = id;
  }
}

export class TaskStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async list() {
    await this.ensureDataFile();
    const content = await readFile(this.filePath, 'utf8');
    const tasks = JSON.parse(content);

    return tasks.sort((first, second) => {
      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });
  }

  async create(input) {
    const now = new Date().toISOString();
    const data = validateTaskInput(input);
    const tasks = await this.list();
    const task = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      assignee: data.assignee,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
      createdAt: now,
      updatedAt: now
    };

    tasks.push(task);
    await this.save(tasks);

    return task;
  }

  async update(id, changes) {
    const tasks = await this.list();
    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      throw new NotFoundError(id);
    }

    const data = validateTaskInput(changes, { partial: true });
    const updated = {
      ...tasks[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    tasks[index] = updated;
    await this.save(tasks);

    return updated;
  }

  async remove(id) {
    const tasks = await this.list();
    const nextTasks = tasks.filter((task) => task.id !== id);

    if (nextTasks.length === tasks.length) {
      throw new NotFoundError(id);
    }

    await this.save(nextTasks);
  }

  async clear() {
    await this.save([]);
  }

  async ensureDataFile() {
    try {
      await readFile(this.filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }

      await this.save([]);
    }
  }

  async save(tasks) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
  }
}

export function validateTaskInput(input, options = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const errors = [];
  const data = {};
  const partial = options.partial === true;

  if (!partial || Object.hasOwn(source, 'title')) {
    const title = normalizeText(source.title);
    if (!title) {
      errors.push({ field: 'title', message: 'Informe o título da tarefa.' });
    } else {
      data.title = title;
    }
  }

  if (!partial || Object.hasOwn(source, 'description')) {
    data.description = normalizeText(source.description);
  }

  if (!partial || Object.hasOwn(source, 'assignee')) {
    data.assignee = normalizeText(source.assignee);
  }

  if (!partial || Object.hasOwn(source, 'dueDate')) {
    const dueDate = normalizeText(source.dueDate);

    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errors.push({ field: 'dueDate', message: 'Use a data no formato AAAA-MM-DD.' });
    } else {
      data.dueDate = dueDate;
    }
  }

  if (!partial || Object.hasOwn(source, 'priority')) {
    const priority = source.priority || 'media';

    if (!TASK_PRIORITIES.includes(priority)) {
      errors.push({ field: 'priority', message: 'Prioridade inválida para a tarefa.' });
    } else {
      data.priority = priority;
    }
  }

  if (!partial || Object.hasOwn(source, 'status')) {
    const status = source.status || 'todo';

    if (!TASK_STATUSES.includes(status)) {
      errors.push({ field: 'status', message: 'Status inválido para a tarefa.' });
    } else {
      data.status = status;
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return data;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}
