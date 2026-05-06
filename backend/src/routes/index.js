import { Router } from 'express';
import { autenticar } from '../middleware/auth.js';
import { authRoutes } from './auth.routes.js';
import {
  especialidadesRoutes,
  laboratoriosRoutes,
  medicamentosRoutes,
  tiposMedicamentoRoutes
} from './crud.routes.js';
import { comprasRoutes, ventasRoutes } from './inventario.routes.js';
import { usuariosRoutes } from './usuarios.routes.js';

export const apiRoutes = Router();

apiRoutes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'farmacia-api' });
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use(autenticar);
apiRoutes.use('/usuarios', usuariosRoutes);
apiRoutes.use('/medicamentos', medicamentosRoutes);
apiRoutes.use('/laboratorios', laboratoriosRoutes);
apiRoutes.use('/tipos-medicamento', tiposMedicamentoRoutes);
apiRoutes.use('/especialidades', especialidadesRoutes);
apiRoutes.use('/compras', comprasRoutes);
apiRoutes.use('/ventas', ventasRoutes);

