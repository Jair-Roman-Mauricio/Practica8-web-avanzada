# Sistema Farmacéutico REST + Next.js

API REST y panel web para gestión farmacéutica con medicamentos, compras, ventas, laboratorios, usuarios, JWT y control por roles.

## Estructura

- `backend/`: Express, Sequelize, PostgreSQL, JWT, Zod, Jest/Supertest.
- `frontend/`: Next.js App Router, TypeScript, proxy seguro con cookies `httpOnly`.
- `AGENTS.md`: orquestador obligatorio de contexto, diseño y skills.
- `CONTEXT.md`: resumen técnico y funcional del proyecto.
- `DESING.md`, `tokens.json`, `css-vars.css`, `desing-tokens.css`: fuente de diseño obligatoria.

## Desarrollo local

```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev:backend
npm run dev:frontend
```

Usuario seed:

- Email: `admin@farmacia.test`
- Password: `Admin12345`

Ejecutar seed:

```bash
npm run seed --prefix backend
```

## Calidad

```bash
npm run test:backend
npm run lint --prefix frontend
npm run build:frontend
```

## Roles

- `ADMIN`: acceso total.
- `VENDEDOR`: ventas y lectura de medicamentos.
- `ALMACEN`: compras, catálogos y medicamentos.

## Despliegue

Backend recomendado en Render:

- Root directory: `backend`
- Build command: `npm install && npm run seed`
- Start command: `npm start`
- Variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL=true`, `JWT_SECRET`, `CORS_ORIGIN`.

Frontend recomendado en Vercel:

- Root directory: `frontend`
- Variable: `API_BASE_URL=https://TU-API.onrender.com/api`

Smoke test:

1. `GET https://TU-API.onrender.com/api/health`
2. Login desde el frontend.
3. Crear catálogos, laboratorio y medicamento.
4. Registrar compra y validar incremento de stock.
5. Registrar venta y validar descuento de stock.

