# API de productos electrónicos

API REST con Node.js, Express y PostgreSQL. Incluye 12 productos iniciales.

## Requisitos

- Node.js 18 o posterior
- PostgreSQL

## Configurar en local

1. Copia `.env.example` a `.env` y configura `DATABASE_URL`.
2. Ejecuta `npm install`.
3. Inicializa el esquema y los productos: `npm run db:init`.
4. Inicia la API: `npm run dev`.

La API escucha en `http://localhost:3000`. Los productos viven en el esquema `electro_api`.

## Rutas

- `GET /health`
- `GET /api/products` (acepta `category` y `search`)
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

En producción, POST, PUT y DELETE requieren `Authorization: Bearer <API_KEY>`.

## Render

El archivo `render.yaml` define un servicio web gratuito y lo conecta a la base PostgreSQL existente `tienda-sara`. La inicialización crea el esquema aislado `electro_api`, sin cambiar tablas de otros proyectos. Render genera `API_KEY` automáticamente. La base gratuita vence el 5 de noviembre de 2026 y se eliminará si no se actualiza a un plan de pago antes de esa fecha.
