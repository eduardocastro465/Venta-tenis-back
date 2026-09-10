import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import type { AuthRequest, CustomJwtPayload } from "../interface/user.interface.js";

export const verificaToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
        req.correo = decoded.correo;
        req.id = decoded.id;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "token expirado" });
        }
        console.log(error);
        return res.status(400).json({ message: "token invalido" });
    }
};