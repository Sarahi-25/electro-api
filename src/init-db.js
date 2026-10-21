import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

try {
  const sqlPath = new URL('../db/init.sql', import.meta.url);
  const sql = await readFile(fileURLToPath(sqlPath), 'utf8');
  await pool.query(sql);
  console.log('Esquema y productos iniciales listos.');
} catch (error) {
  console.error('No se pudo inicializar PostgreSQL:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
