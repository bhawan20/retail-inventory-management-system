const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'retail_inventory.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

function exec(sql) {
  return db.exec(sql);
}

module.exports = {
  db,
  query,
  get,
  run,
  exec,
  dbPath
};
