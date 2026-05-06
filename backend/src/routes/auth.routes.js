import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { autenticar } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../schemas/index.js';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), register);
authRoutes.post('/login', validate(loginSchema), login);
authRoutes.get('/me', autenticar, me);

