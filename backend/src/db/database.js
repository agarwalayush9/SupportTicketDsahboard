const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let _db = null;

/**
 * Returns the singleton database connection.
 * The database file path can be overridden via the DB_PATH environment variable,
 * which allows tests to use an isolated database file.
 */
function getDb() {
  if (_db) return _db;

  const DB_DIR = process.env.DB_PATH
    ? path.dirname(process.env.DB_PATH)
    : path.join(__dirname, '../../data');
  const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'tickets.db');

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initializeSchema(_db);
  return _db;
}

/**
 * Initialize the database schema.
 * Creates the tickets table and updated_at trigger if they don't already exist.
 */
function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL CHECK(length(title) <= 120),
      description TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      priority    TEXT    NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
      status      TEXT    NOT NULL CHECK(status IN ('Open', 'In Progress', 'Resolved')) DEFAULT 'Open',
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TRIGGER IF NOT EXISTS update_tickets_updated_at
    AFTER UPDATE ON tickets
    FOR EACH ROW
    BEGIN
      UPDATE tickets SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
    END;
  `);
}

/**
 * Close and reset the database connection.
 * Used by tests to release file handles between runs.
 */
function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

module.exports = { getDb, closeDb };
