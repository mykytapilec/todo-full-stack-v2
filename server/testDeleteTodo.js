const BASE_URL = 'http://localhost:3000/api/todos';

// ⚠️ первый id ДОЛЖЕН реально существовать в БД
const EXISTING_ID = '9e54803d-5a5a-4651-822e-99925084aa9b';
const MISSING_ID = '00000000-0000-0000-0000-000000000000';

async function testDelete(id, description) {
  console.log(`\n---\nDELETE /todos/${id}\n${description}`);

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  let body = null;
  if (res.status !== 204) {
    body = await res.json();
  }

  console.log('Status:', res.status);
  console.log('Body:', body ?? '(пусто, 204 No Content)');
}

(async () => {
  // 1️⃣ Удаляем существующую тудушку → 204
  await testDelete(EXISTING_ID, 'Существующая тудушка (ожидаем 204)');

  // 2️⃣ Повторное удаление → 404
  await testDelete(EXISTING_ID, 'Повторное удаление (ожидаем 404)');

  // 3️⃣ Удаление несуществующей → 404
  await testDelete(MISSING_ID, 'Несуществующая тудушка (ожидаем 404)');
})();
