import type { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";
import type { Request } from "express";

export interface IUser extends Document {
    id: string;
    fotoPerfil: string;
    usuario: string;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    contrasena: string;
    rol: 'cliente' | 'propietario' | 'admin';
    refreshTokens: string[];
    estado: 'activo' | 'inactivo' | 'en_verificacion' | 'suspendido';
}

export interface AccessTokenPayload {
    id: string;
    rol: 'cliente' | 'propietario' | 'admin';
}

export interface AuthRequest extends Request {
    correo?: string;
    id?: string;
    rol?: string;
}

export interface CustomJwtPayload extends JwtPayload {
    correo: string;
    id: string;
    rol: string;
}