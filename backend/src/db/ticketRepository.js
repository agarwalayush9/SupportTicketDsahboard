const { getDb } = require('./database');

/**
 * Builds and executes a paginated, filtered, sorted query for tickets.
 */
function listTickets({ search, status, priority, sort, page, limit }) {
  const db = getDb();
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const offset = (pageNum - 1) * pageSize;

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(title LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderDir = sort === 'asc' ? 'ASC' : 'DESC';
  const orderClause = `ORDER BY created_at ${orderDir}`;

  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM tickets ${where}`)
    .get(...params);

  const rows = db
    .prepare(`SELECT * FROM tickets ${where} ${orderClause} LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);

  return {
    data: rows,
    pagination: {
      total: countRow.total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(countRow.total / pageSize),
    },
  };
}

/**
 * Returns summary counts for all tickets (ignoring filters).
 */
function getSummaryCounts() {
  const db = getDb();
  return db
    .prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
      FROM tickets`
    )
    .get();
}

/**
 * Retrieves a single ticket by ID.
 */
function getTicketById(id) {
  return getDb().prepare('SELECT * FROM tickets WHERE id = ?').get(id);
}

/**
 * Inserts a new ticket and returns the created record.
 */
function createTicket({ title, description, email, priority = 'Medium', status = 'Open' }) {
  const db = getDb();
  const result = db
    .prepare(`INSERT INTO tickets (title, description, email, priority, status) VALUES (?, ?, ?, ?, ?)`)
    .run(title, description, email, priority, status);
  return getTicketById(result.lastInsertRowid);
}

/**
 * Updates status and/or priority of an existing ticket.
 */
function updateTicket(id, { status, priority }) {
  const db = getDb();
  const fields = [];
  const values = [];

  if (status !== undefined) { fields.push('status = ?'); values.push(status); }
  if (priority !== undefined) { fields.push('priority = ?'); values.push(priority); }

  if (fields.length === 0) return getTicketById(id);

  values.push(id);
  db.prepare(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getTicketById(id);
}

module.exports = { listTickets, getSummaryCounts, getTicketById, createTicket, updateTicket };
