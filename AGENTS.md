# AGENTS.md

## Orden obligatorio de contexto

Para cualquier petición en este proyecto, el agente debe leer primero:

1. `AGENTS.md`
2. `CONTEXT.md`
3. `DESING.md`
4. `tokens.json`
5. `css-vars.css`
6. `desing-tokens.css`

## Reglas de diseño

- Respetar la guía visual Apple-like definida en `DESING.md`.
- Usar `#f5f5f7` como canvas principal y `#ffffff` como superficie de tarjetas.
- Reservar `#0071e3` para acciones primarias.
- Usar radio `28px` en tarjetas y `999px` en botones primarios.
- No usar sombras en tarjetas o contenedores.
- Usar tipografía de sistema con fallback SF Pro / Inter / system-ui.
- Mantener interfaces limpias, operativas y densas donde el flujo administrativo lo requiera.

## Orquestación de skills

- Diseño/frontend: `frontend-app-builder`, `web-design-guidelines`.
- React/Next.js: `react-best-practices`.
- Node/API/JWT: `nodejs-best-practices`.
- PostgreSQL/Sequelize/modelado: `supabase-postgres-best-practices`.
- Despliegue Vercel/Render: `deploy-to-vercel`, y revisar variables de entorno.
- Búsqueda de nuevas skills: `find-skills`.

## Arquitectura esperada

- `backend/`: API REST con Express, Sequelize, PostgreSQL, JWT y roles.
- `frontend/`: Next.js App Router con panel operativo y proxy seguro mediante cookies `httpOnly`.
- `Models`, `Controllers`, `Routes`, `Middleware` son capas obligatorias del backend.

## Seguridad

- Nunca exponer `JWT_SECRET`, credenciales de base de datos ni `.env` reales.
- Las contraseñas se guardan únicamente con hash `bcrypt`.
- Las rutas protegidas deben validar JWT y roles.
- ADMIN tiene acceso total, VENDEDOR ventas, ALMACEN compras e inventario.

