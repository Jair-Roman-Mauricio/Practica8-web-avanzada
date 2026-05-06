# CONTEXT.md

## Proyecto

Sistema farmacéutico para gestionar medicamentos, compras, ventas, laboratorios y usuarios mediante API REST y frontend Next.js.

## Stack

- Backend: Node.js, Express, Sequelize, PostgreSQL, JWT, bcrypt, Zod.
- Frontend: Next.js App Router, TypeScript, CSS global con tokens de diseño.
- Base de datos cloud esperada: PostgreSQL en Render.
- Frontend esperado: Vercel.

## Roles

- `ADMIN`: acceso total.
- `VENDEDOR`: acceso a ventas y lectura de medicamentos.
- `ALMACEN`: acceso a compras, catálogos y medicamentos.

## Reglas de negocio

- No registrar usuarios duplicados por email.
- Toda venta valida stock antes de guardarse.
- Una venta válida descuenta stock automáticamente.
- Una compra válida incrementa stock automáticamente.
- Compras y ventas se guardan en transacciones.
- Los errores deben responder con HTTP status controlado.

## Entidades principales

- Usuario: nombre, email, passwordHash, rol, activo.
- Laboratorio: razón social, dirección, teléfono, email, contacto.
- TipoMedicamento: descripción.
- Especialidad: descripción.
- Medicamento: descripción, fechas, presentación, stock, precios, marca, tipo, especialidad.
- OrdenCompra y DetalleOrdenCompra.
- OrdenVenta y DetalleOrdenVenta.

## Endpoints públicos del backend

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- CRUD `/api/usuarios`
- CRUD `/api/medicamentos`
- CRUD `/api/laboratorios`
- CRUD `/api/tipos-medicamento`
- CRUD `/api/especialidades`
- `GET/POST /api/compras`
- `GET /api/compras/:id`
- `GET/POST /api/ventas`
- `GET /api/ventas/:id`

## Variables de entorno

Backend:

- `PORT`
- `NODE_ENV`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Frontend:

- `API_BASE_URL`

## Comandos

Backend:

- `cd backend && npm install`
- `npm run dev`
- `npm test`
- `npm run seed`

Frontend:

- `cd frontend && npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`

