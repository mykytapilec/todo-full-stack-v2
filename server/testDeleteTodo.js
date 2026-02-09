import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/todos';

const todosToTest = [
  { id: '72f09348-5736-4917-a5ac-0750cdc1902f', desc: 'Существующая тудушка (ожидаем 204)' },
  { id: '00000000-0000-0000-0000-000000000000', desc: 'Несуществующая тудушка (ожидаем 404)' }
];

(async () => {
  for (const todo of todosToTest) {
    console.log(`\n---\nDELETE /todos/${todo.id}\n(${todo.desc})`);

    try {
      const res = await fetch(`${BASE_URL}/${todo.id}/delete`, { method: 'PUT' });
      const body = res.status !== 204 ? await res.json() : null;

      console.log('Status:', res.status);
      console.log('Body:', body || '(пусто, 204 No Content)');
    } catch (err) {
      console.error('Ошибка при запросе:', err);
    }
  }
})();
