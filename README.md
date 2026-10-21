# API de productos electrónicos

API REST local con Node.js, Express y PostgreSQL. Incluye 12 productos iniciales.

## Requisitos

- Node.js 18 o posterior
- PostgreSQL

## Configurar en local

1. Copia `.env.example` a `.env` y configura `DATABASE_URL`.
2. Ejecuta `npm install`.
3. Inicializa el esquema y los productos: `npm run db:init`.
4. Inicia la API: `npm run dev`.

La API escucha en `http://localhost:3000`.

## Rutas

- `GET /health`
- `GET /api/products` (acepta `category` y `search`)
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

En producción, POST, PUT y DELETE requieren `Authorization: Bearer <API_KEY>`.

## Render

El archivo `render.yaml` define el servicio y PostgreSQL. Render genera `API_KEY` y la tabla se inicializa al arrancar. La base gratuita de Render vence a los 30 días; actualízala a un plan de pago antes del vencimiento si quieres conservarla.
