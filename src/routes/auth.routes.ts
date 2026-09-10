// routes/usuarios.routes.ts
import { Router } from 'express';
import { Login, logout, logoutAll, refreshToken, registrarUsuario } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', Login);
router.post('/register', registrarUsuario);
router.post('/logout', logout);
router.post('/logoutAll', logoutAll);
router.post('/refreshToken', refreshToken);


export default router;