import 'dotenv/config';
import { timingSafeEqual } from 'node:crypto';
import express from 'express';
import { pool } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3000);
app.use(express.json());

function protectWriteOperations(req, res, next) {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return next();
  const expected = process.env.API_KEY;
  if (!expected && process.env.NODE_ENV !== 'production') return next();
  if (!expected) return res.status(503).json({ error: 'API_KEY no configurada' });

  const provided = req.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] ?? '';
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  const matches = expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
  if (!matches) return res.status(401).json({ error: 'Se requiere una API key válida en Authorization: Bearer <API_KEY>' });
  next();
}

app.use('/api/products', protectWriteOperations);

const fields = ['sku', 'name', 'category', 'brand', 'description', 'price', 'stock'];
const productColumns = 'id, sku, name, category, brand, description, price, stock, created_at, updated_at';

function validateProduct(body, partial = false) {
  const errors = [];
  for (const key of ['sku', 'name', 'category', 'brand']) {
    if ((!partial || body[key] !== undefined) && (typeof body[key] !== 'string' || !body[key].trim())) {
      errors.push(`${key} debe ser texto y no puede estar vacío`);
    }
  }
  if ((!partial || body.description !== undefined) && body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description debe ser texto');
  }
  if ((!partial || body.price !== undefined) && (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)) {
    errors.push('price debe ser un número mayor o igual a 0');
  }
  if ((!partial || body.stock !== undefined) && (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0)) {
    errors.push('stock debe ser un entero mayor o igual a 0');
  }
  return errors;
}

app.get('/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) { next(error); }
});

app.get('/api/products', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const conditions = [];
    const values = [];
    if (category) { values.push(category); conditions.push(`category ILIKE $${values.length}`); }
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(name ILIKE $${values.length} OR brand ILIKE $${values.length} OR sku ILIKE $${values.length})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT ${productColumns} FROM products ${where} ORDER BY id`, values);
    res.json({ data: result.rows, count: result.rowCount });
  } catch (error) { next(error); }
});

app.get('/api/products/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${productColumns} FROM products WHERE id = $1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

app.post('/api/products', async (req, res, next) => {
  const errors = validateProduct(req.body);
  if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors });
  try {
    const values = fields.map((field) => req.body[field] ?? (field === 'description' ? '' : null));
    const result = await pool.query(
      `INSERT INTO products (sku, name, category, brand, description, price, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${productColumns}`,
      values
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

app.put('/api/products/:id', async (req, res, next) => {
  const errors = validateProduct(req.body, true);
  if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors });
  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!existing.rowCount) return res.status(404).json({ error: 'Producto no encontrado' });
    const current = existing.rows[0];
    const merged = Object.fromEntries(fields.map((field) => [field, req.body[field] ?? current[field]]));
    const values = [...fields.map((field) => merged[field]), req.params.id];
    const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
    const result = await pool.query(
      `UPDATE products SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING ${productColumns}`,
      values
    );
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === '23505') return res.status(409).json({ error: 'Ya existe un producto con ese SKU' });
  if (error.code === '22P02') return res.status(400).json({ error: 'ID de producto inválido' });
  res.status(500).json({ error: 'Error interno del servidor' });
});

const server = app.listen(port, () => console.log(`API lista en http://localhost:${port}`));

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
