import type { Response, NextFunction } from 'express';
import type { LangRequest } from './lang.middleware.js';
import admin from '../config/firebase.js';

export interface AuthRequest extends LangRequest {
    uid?: string;
    userEmail?: string | undefined;
}

export const verificarToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: req.msg?.auth.missingToken || 'No autorizado, falta token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: req.msg?.auth.emptyToken || 'No autorizado, token vacio' });
    }

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.uid = decoded.uid;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        res.status(401).json({ error: req.msg?.auth.invalidToken || 'Token invalido o expirado' });
    }
};