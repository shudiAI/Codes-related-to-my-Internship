import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { seedDatabase } from './seed.js';

const DB_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');
const SCHEMA_PATH = path.resolve(process.cwd(), 'server', 'db', 'schema.sql');

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON;');

  // Initialize schema if needed
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await dbInstance.exec(schemaSql);
  }

  // CREATE TABLE IF NOT EXISTS does not add columns to an existing database.
  // Keep this migration additive so existing cases and correspondence remain intact.
  const caseColumns = await dbInstance.all('PRAGMA table_info(cases)');
  const caseColumnNames = new Set(caseColumns.map(column => column.name));
  if (!caseColumnNames.has('project_type')) {
    await dbInstance.exec('ALTER TABLE cases ADD COLUMN project_type TEXT');
  }
  if (!caseColumnNames.has('work_method')) {
    await dbInstance.exec("ALTER TABLE cases ADD COLUMN work_method TEXT DEFAULT 'N/A'");
  }
  if (!caseColumnNames.has('project_description')) {
    await dbInstance.exec('ALTER TABLE cases ADD COLUMN project_description TEXT');
  }

  // Seed database if empty
  await seedDatabase(dbInstance);

  return dbInstance;
}
