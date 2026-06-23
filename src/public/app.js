const statusLabels = {
  todo: 'A fazer',
  'in-progress': 'Em progresso',
  done: 'Concluído'
};

const nextStatus = {
  todo: { value: 'in-progress', label: 'Iniciar' },
  'in-progress': { value: 'done', label: 'Concluir' },
  done: { value: 'todo', label: 'Reabrir' }
};

const elements = {
  form: document.querySelector('#task-form'),
  statusFilter: document.querySelector('#status-filter'),
  searchInput: document.querySelector('#search-input'),
  template: document.querySelector('#task-card-template'),
  lists: {
    todo: document.querySelector('#todo-list'),
    'in-progress': document.querySelector('#in-progress-list'),
    done: document.querySelector('#done-list')
  },
  counts: {
    total: document.querySelector('#total-count'),
    done: document.querySelector('#done-count'),
    todoColumn: document.querySelector('#todo-count'),
    inProgressColumn: document.querySelector('#in-progress-count'),
    doneColumn: document.querySelector('#done-column-count')
  }
};

const state = {
  tasks: []
};

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const task = Object.fromEntries(formData.entries());

  await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task)
  });

  elements.form.reset();
  await loadTasks();
});

elements.statusFilter.addEventListener('change', loadTasks);
elements.searchInput.addEventListener('input', debounce(loadTasks, 220));

for (const list of Object.values(elements.lists)) {
  list.addEventListener('click', async (event) => {
    const button = event.target.closest('button');

    if (!button) {
      return;
    }

    const card = event.target.closest('[data-task-id]');
    const task = state.tasks.find((item) => item.id === card.dataset.taskId);

    if (button.dataset.action === 'delete') {
      await request(`/api/tasks/${task.id}`, { method: 'DELETE' });
    }

    if (button.dataset.action === 'move') {
      await request(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus[task.status].value })
      });
    }

    await loadTasks();
  });
}

await loadTasks();

async function loadTasks() {
  const params = new URLSearchParams();
  const status = elements.statusFilter.value;
  const query = elements.searchInput.value.trim();

  if (status !== 'all') {
    params.set('status', status);
  }

  if (query) {
    params.set('q', query);
  }

  const payload = await request(`/api/tasks?${params.toString()}`);
  state.tasks = payload.tasks;
  render();
}

function render() {
  for (const list of Object.values(elements.lists)) {
    list.replaceChildren();
  }

  const grouped = {
    todo: [],
    'in-progress': [],
    done: []
  };

  for (const task of state.tasks) {
    grouped[task.status].push(task);
  }

  for (const [status, tasks] of Object.entries(grouped)) {
    if (tasks.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Sem tarefas';
      elements.lists[status].append(empty);
      continue;
    }

    for (const task of tasks) {
      elements.lists[status].append(createTaskCard(task));
    }
  }

  elements.counts.total.textContent = String(state.tasks.length);
  elements.counts.done.textContent = String(grouped.done.length);
  elements.counts.todoColumn.textContent = String(grouped.todo.length);
  elements.counts.inProgressColumn.textContent = String(grouped['in-progress'].length);
  elements.counts.doneColumn.textContent = String(grouped.done.length);
}

function createTaskCard(task) {
  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector('.task-card');
  const title = fragment.querySelector('h3');
  const description = fragment.querySelector('.task-card__description');
  const statusBadge = fragment.querySelector('.status-badge');
  const assignee = fragment.querySelector('[data-field="assignee"]');
  const dueDate = fragment.querySelector('[data-field="dueDate"]');
  const moveButton = fragment.querySelector('[data-action="move"]');

  card.dataset.taskId = task.id;
  title.textContent = task.title;
  description.textContent = task.description || 'Sem descrição';
  statusBadge.textContent = statusLabels[task.status];
  statusBadge.classList.add(task.status);
  assignee.textContent = task.assignee || 'Não definido';
  dueDate.textContent = task.dueDate || 'Sem prazo';
  moveButton.textContent = nextStatus[task.status].label;

  return fragment;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (response.status === 204) {
    return {};
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Falha ao processar requisição.');
  }

  return payload;
}

function debounce(callback, delay) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
}

