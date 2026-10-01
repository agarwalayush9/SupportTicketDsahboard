/**
 * Automated tests for the Support Ticket API.
 *
 * Covers:
 * 1. POST /api/tickets — validation rules (title, email, length limits)
 * 2. GET /api/tickets  — filtering, sorting, and pagination
 * 3. PATCH /api/tickets/:id — status/priority updates
 * 4. GET /api/tickets/summary — aggregate counts
 * 5. Edge cases — 404, unknown routes
 *
 * Run with: npm test (inside /backend)
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Use an in-memory / temp database for tests to avoid polluting production data
process.env.NODE_ENV = 'test';
const DB_PATH = path.join(__dirname, '../../../data/test_tickets.db');
// Remove stale test DB before running
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

// Override DB path via env for the database module
process.env.DB_PATH = DB_PATH;

const app = require('../app');
const { closeDb } = require('../db/database');

afterAll(() => {
  closeDb();
  // Clean up test DB file
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
});


// ─── Helpers ───────────────────────────────────────────────────────────────

const validTicket = () => ({
  title: 'Test ticket',
  description: 'This is a test description.',
  email: 'test@example.com',
  priority: 'Medium',
  status: 'Open',
});

// ─── Suite: POST /api/tickets ───────────────────────────────────────────────

describe('POST /api/tickets', () => {
  test('creates a ticket with all valid fields', async () => {
    const res = await request(app).post('/api/tickets').send(validTicket());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Test ticket',
      email: 'test@example.com',
      priority: 'Medium',
      status: 'Open',
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.created_at).toBeDefined();
  });

  test('returns 422 when title is missing', async () => {
    const payload = { ...validTicket(), title: '' };
    const res = await request(app).post('/api/tickets').send(payload);
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Validation failed');
    const fields = res.body.details.map((d) => d.field);
    expect(fields).toContain('title');
  });

  test('returns 422 when title exceeds 120 characters', async () => {
    const payload = { ...validTicket(), title: 'A'.repeat(121) };
    const res = await request(app).post('/api/tickets').send(payload);
    expect(res.status).toBe(422);
    const messages = res.body.details.map((d) => d.message);
    expect(messages.some((m) => m.includes('120'))).toBe(true);
  });

  test('returns 422 for an invalid email address', async () => {
    const payload = { ...validTicket(), email: 'not-an-email' };
    const res = await request(app).post('/api/tickets').send(payload);
    expect(res.status).toBe(422);
    const fields = res.body.details.map((d) => d.field);
    expect(fields).toContain('email');
  });

  test('returns 422 for an invalid priority value', async () => {
    const payload = { ...validTicket(), priority: 'Urgent' };
    const res = await request(app).post('/api/tickets').send(payload);
    expect(res.status).toBe(422);
  });

  test('defaults status to Open and priority to Medium when omitted', async () => {
    const { status, priority, ...rest } = validTicket();
    const res = await request(app).post('/api/tickets').send(rest);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Open');
    expect(res.body.priority).toBe('Medium');
  });
});

// ─── Suite: GET /api/tickets ────────────────────────────────────────────────

describe('GET /api/tickets', () => {
  beforeAll(async () => {
    // Seed a few tickets for query tests
    const tickets = [
      { title: 'Alpha urgent issue', description: 'Desc', email: 'alpha@test.com', priority: 'High', status: 'Open' },
      { title: 'Beta billing problem', description: 'Desc', email: 'beta@test.com', priority: 'Low', status: 'Resolved' },
      { title: 'Gamma login error', description: 'Desc', email: 'gamma@test.com', priority: 'Medium', status: 'In Progress' },
      { title: 'Delta export bug', description: 'Desc', email: 'alpha@test.com', priority: 'High', status: 'Open' },
    ];
    for (const t of tickets) {
      await request(app).post('/api/tickets').send(t);
    }
  });

  test('returns paginated results with pagination meta', async () => {
    const res = await request(app).get('/api/tickets?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2 });
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(4);
  });

  test('filters by status=Resolved', async () => {
    const res = await request(app).get('/api/tickets?status=Resolved');
    expect(res.status).toBe(200);
    res.body.data.forEach((t) => expect(t.status).toBe('Resolved'));
  });

  test('filters by priority=High', async () => {
    const res = await request(app).get('/api/tickets?priority=High');
    expect(res.status).toBe(200);
    res.body.data.forEach((t) => expect(t.priority).toBe('High'));
  });

  test('searches by email', async () => {
    const res = await request(app).get('/api/tickets?search=alpha@test.com');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    res.body.data.forEach((t) => expect(t.email).toBe('alpha@test.com'));
  });

  test('searches by title keyword', async () => {
    const res = await request(app).get('/api/tickets?search=billing');
    expect(res.status).toBe(200);
    expect(res.body.data.some((t) => t.title.toLowerCase().includes('billing'))).toBe(true);
  });

  test('sorts ascending by created_at', async () => {
    const res = await request(app).get('/api/tickets?sort=asc');
    expect(res.status).toBe(200);
    const dates = res.body.data.map((t) => t.created_at);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  test('returns 422 for invalid sort value', async () => {
    const res = await request(app).get('/api/tickets?sort=random');
    expect(res.status).toBe(422);
  });
});

// ─── Suite: PATCH /api/tickets/:id ─────────────────────────────────────────

describe('PATCH /api/tickets/:id', () => {
  let ticketId;

  beforeAll(async () => {
    const res = await request(app).post('/api/tickets').send(validTicket());
    ticketId = res.body.id;
  });

  test('updates status to Resolved', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .send({ status: 'Resolved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Resolved');
  });

  test('updates priority to High', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .send({ priority: 'High' });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('High');
  });

  test('returns 404 for non-existent ticket', async () => {
    const res = await request(app)
      .patch('/api/tickets/99999')
      .send({ status: 'Resolved' });
    expect(res.status).toBe(404);
  });

  test('returns 422 when body has no valid fields', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .send({});
    expect(res.status).toBe(422);
  });

  test('returns 422 for invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .send({ status: 'Closed' });
    expect(res.status).toBe(422);
  });
});

// ─── Suite: GET /api/tickets/summary ───────────────────────────────────────

describe('GET /api/tickets/summary', () => {
  test('returns total and per-status counts as numbers', async () => {
    const res = await request(app).get('/api/tickets/summary');
    expect(res.status).toBe(200);
    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.open).toBe('number');
    expect(typeof res.body.in_progress).toBe('number');
    expect(typeof res.body.resolved).toBe('number');
  });
});

// ─── Suite: GET /api/tickets/:id ───────────────────────────────────────────

describe('GET /api/tickets/:id', () => {
  test('returns 404 for a ticket that does not exist', async () => {
    const res = await request(app).get('/api/tickets/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Ticket not found.');
  });

  test('returns the correct ticket by id', async () => {
    const created = await request(app).post('/api/tickets').send(validTicket());
    const res = await request(app).get(`/api/tickets/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });
});

// ─── Suite: Unknown routes ──────────────────────────────────────────────────

describe('Unknown routes', () => {
  test('returns 404 for undefined endpoint', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});
