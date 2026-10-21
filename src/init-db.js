import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const client = await pool.connect();
try {
  await client.query('CREATE SCHEMA IF NOT EXISTS electro_api');
  await client.query('SET search_path TO electro_api');
  const sqlPath = new URL('../db/init.sql', import.meta.url);
  const sql = await readFile(fileURLToPath(sqlPath), 'utf8');
  await client.query(sql);
  console.log('Esquema electro_api y productos iniciales listos.');
} catch (error) {
  console.error('No se pudo inicializar PostgreSQL:', error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
