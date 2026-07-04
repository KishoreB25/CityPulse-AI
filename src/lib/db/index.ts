import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Using a local SQLite database for Phase 0 and 1 local development
const sqlite = new Database(path.join(process.cwd(), 'sqlite.db'));

export const db = drizzle(sqlite, { schema });
