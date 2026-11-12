const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, randomBytes } = require('node:crypto');
const { gzipSync } = require('node:zlib');
require('tsx/cjs');

// The HTTP stack is real; the data boundary is replaced before importing app.
// No test can use the developer's DATABASE_URL or JWT_SECRET.
process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = 'postgresql://localhost:1/pizzaup_test';
process.env.JWT_SECRET = randomBytes(48).toString('base64url');
process.env.CORS_ORIGINS = 'https://dashboard.example.invalid';
process.env.TRUST_PROXY_HOPS = '0';
const { sign } = require('jsonwebtoken');
const { hashSync } = require('bcryptjs');
const { env, JWT_ISSUER, JWT_AUDIENCE } = require('../src/config/env.ts');
const ids = Object.fromEntries(['admin', 'staff', 'order', 'product', 'category', 'otherCategory', 'item'].map(key => [key, randomUUID()]));
const strongPassword = 'Security regression password 2026';
const passwordHash = hashSync(strongPassword, 12);
let users, order, items, products, calls, failCategory;
const prisma = {
  user: {
    findUnique: async ({ where }) => users.find(user => user.id === where.id) ?? null,
    findFirst: async ({ where }) => users.find(user => user.email.toLowerCase() === (where.email.equals ?? where.email).toLowerCase()) ?? null,
    create: async ({ data }) => { const user = { id: randomUUID(), ...data }; users.push(user); const { password, ...safe } = user; return safe; },
    update: async ({ where, data }) => Object.assign(users.find(user => user.id === where.id), data),
  },
  category: {
    findUnique: async ({ where }) => where.id === ids.category ? { id: ids.category } : null,
    findMany: async () => { if (failCategory) throw new Error('private database detail must never escape'); return []; },
  },
  product: {
    findFirst: async ({ where }) => products.find(product => product.id === where.id && product.disabled === where.disabled) ?? null,
    findMany: async ({ where }) => { calls.push({ model: 'product', where }); return products.filter(product => product.category_id === where.category_id && !product.disabled); },
  },
  order: {
    findUnique: async ({ where }) => order?.id === where.id ? { ...order } : null,
    findFirst: async () => { throw new Error('Product lookup must not use Order.findFirst'); },
    update: async ({ data }) => Object.assign(order, data),
    delete: async () => { order = null; items = []; return {}; },
    findMany: async () => order ? [{ ...order, items }] : [],
  },
  item: {
    count: async ({ where }) => items.filter(item => item.order_id === where.order_id).length,
    create: async ({ data }) => { const item = { id: randomUUID(), ...data, product: products.find(product => product.id === data.product_id) }; items.push(item); return item; },
    findUnique: async ({ where }) => items.find(item => item.id === where.id) ?? null,
    deleteMany: async ({ where }) => { const count = items.length; items = items.filter(item => item.id !== where.id || item.order_id !== where.order_id); return { count: count - items.length }; },
  },
  $queryRaw: async (sql, ...values) => { calls.push({ sql: sql.join('?'), values }); return order?.id === values[0] ? [{ id: order.id }] : []; },
  $transaction: async callback => callback(prisma),
};
const prismaPath = require.resolve('../src/prisma/index.ts');
require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: { __esModule: true, default: prisma } };
const { createApp } = require('../src/app.ts');
let server, base;
const token = (role, options = {}) => sign({}, env.JWT_SECRET, {
  subject: ids[role], algorithm: 'HS256', expiresIn: 3600, issuer: JWT_ISSUER, audience: JWT_AUDIENCE, ...options,
});
async function request(path, { role, bearer, method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(role ? { Authorization: `Bearer ${token(role)}` } : {}), ...(bearer ? { Authorization: bearer } : {}), ...headers },
    ...(body === undefined ? {} : { body: typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body) }),
  });
  return { status: response.status, body: await response.json(), headers: response.headers };
}
before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); server.closeAllConnections(); });
beforeEach(() => {
  users = [
    { id: ids.admin, name: 'Administrator', email: 'admin@example.invalid', password: passwordHash, role: 'ADMIN' },
    { id: ids.staff, name: 'Staff', email: 'staff@example.invalid', password: passwordHash, role: 'STAFF' },
  ];
  order = { id: ids.order, table: 1, draft: true, status: false };
  items = [];
  products = [
    { id: ids.product, category_id: ids.category, disabled: false },
    { id: randomUUID(), category_id: ids.otherCategory, disabled: false },
  ];
  calls = []; failCategory = false;
});

test('anonymous users and STAFF cannot provision staff accounts', async () => {
  const body = { name: 'New staff', email: 'new@example.invalid', password: strongPassword };
  assert.equal((await request('/users', { method: 'POST', body })).status, 401);
  assert.equal((await request('/users', { method: 'POST', role: 'staff', body })).status, 403);
  assert.equal(users.length, 2);
});
test('ADMIN creates only STAFF and weak passwords are refused', async () => {
  const body = { name: 'New staff', email: 'NEW@example.invalid', password: strongPassword, role: 'ADMIN' };
  assert.equal((await request('/users', { method: 'POST', role: 'admin', body: { ...body, password: 'teste123' } })).status, 400);
  const response = await request('/users', { method: 'POST', role: 'admin', body });
  assert.equal(response.status, 200);
  assert.equal(response.body.role, 'STAFF');
  assert.equal(response.body.email, 'new@example.invalid');
  assert.equal(response.body.password, undefined);
});
test('deleted users and invalid JWT claims are refused before authorization', async () => {
  users = [];
  assert.equal((await request('/me', { role: 'admin' })).status, 401);
  assert.equal((await request('/me', { bearer: `Basic ${token('admin')}` })).status, 401);
  assert.equal((await request('/me', { bearer: `Bearer ${token('admin', { audience: 'other-app' })}` })).status, 401);
  assert.equal((await request('/me', { bearer: `Bearer ${token('admin', { expiresIn: -1 })}` })).status, 401);
});
test('STAFF cannot finish or delete orders by calling the API directly', async () => {
  assert.equal((await request('/order/finish', { method: 'PUT', role: 'staff', body: { order_id: ids.order } })).status, 403);
  assert.equal((await request(`/order?order_id=${ids.order}`, { method: 'DELETE', role: 'staff' })).status, 403);
});
test('category filter reaches the product query', async () => {
  const response = await request(`/category/product?category_id=${ids.category}`, { role: 'staff' });
  assert.equal(response.status, 200);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].category_id, ids.category);
});
test('adding an active product works and acquires a parameterized parent row lock', async () => {
  const response = await request('/order/add', { method: 'POST', role: 'staff', body: { order_id: ids.order, product_id: ids.product, amount: 2 } });
  assert.equal(response.status, 201);
  assert.equal(items[0].amount, 2);
  assert.match(calls[0].sql, /FOR UPDATE/);
  assert.deepEqual(calls[0].values, [ids.order]);
});
test('archived products and invalid quantities cannot be added', async () => {
  products[0].disabled = true;
  const body = { order_id: ids.order, product_id: ids.product, amount: 1 };
  assert.equal((await request('/order/add', { method: 'POST', role: 'staff', body })).status, 404);
  assert.equal((await request('/order/add', { method: 'POST', role: 'staff', body: { ...body, amount: 0 } })).status, 400);
  assert.equal((await request('/order/add', { method: 'POST', role: 'staff', body: { ...body, amount: 2147483648 } })).status, 400);
  assert.equal(items.length, 0);
});
test('sent orders reject additional items and removals', async () => {
  order.draft = false;
  items.push({ id: ids.item, order_id: ids.order });
  assert.equal((await request('/order/add', { method: 'POST', role: 'staff', body: { order_id: ids.order, product_id: ids.product, amount: 1 } })).status, 409);
  assert.equal((await request(`/order/remove?item_id=${ids.item}`, { method: 'DELETE', role: 'staff' })).status, 409);
  assert.equal(items.length, 1);
});
test('empty orders cannot be sent; populated drafts are sent exactly once', async () => {
  const args = { method: 'PUT', role: 'staff', body: { order_id: ids.order, name: 'Customer' } };
  assert.equal((await request('/order/send', args)).status, 409);
  items.push({ id: ids.item, order_id: ids.order });
  assert.equal((await request('/order/send', args)).status, 200);
  assert.equal((await request('/order/send', args)).status, 409);
});
test('only sent pending orders can be finished', async () => {
  const args = { method: 'PUT', role: 'admin', body: { order_id: ids.order } };
  assert.equal((await request('/order/finish', args)).status, 409);
  order.draft = false;
  assert.equal((await request('/order/finish', args)).status, 200);
  assert.equal((await request('/order/finish', args)).status, 409);
});
test('draft item removal works and submitted orders cannot be deleted', async () => {
  items.push({ id: ids.item, order_id: ids.order });
  assert.equal((await request(`/order/remove?item_id=${ids.item}`, { method: 'DELETE', role: 'staff' })).status, 200);
  assert.equal(items.length, 0);
  order.draft = false;
  assert.equal((await request(`/order?order_id=${ids.order}`, { method: 'DELETE', role: 'admin' })).status, 409);
});
test('unexpected database failures return a generic 500', async () => {
  failCategory = true;
  const response = await request('/category', { role: 'staff' });
  assert.equal(response.status, 500);
  assert.deepEqual(response.body, { error: 'Erro interno do servidor.' });
});
test('compressed requests are rejected and response headers restrict browsers', async () => {
  assert.equal((await request('/session', { method: 'POST', body: gzipSync('{}'), headers: { 'Content-Encoding': 'gzip' } })).status, 415);
  const response = await request('/health', { headers: { Origin: 'https://attacker.example.invalid' } });
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(response.headers.get('content-security-policy'));
  assert.ok(response.headers.get('strict-transport-security'));
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});
test('production rejects legacy demo passwords and limits account guesses', async () => {
  users[1].password = hashSync('teste123', 12);
  assert.equal((await request('/session', { method: 'POST', body: { email: users[1].email, password: 'teste123' } })).status, 401);
  let response;
  for (let i = 0; i < 11; i++) {
    response = await request('/session', { method: 'POST', body: { email: 'guess@example.invalid', password: 'incorrect' } });
  }
  assert.equal(response.status, 429);
  assert.ok(response.headers.get('retry-after'));
});
