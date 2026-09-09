import { Document } from "mongoose";

export interface IUser extends Document {
    id: string;
    fotoPerfil: string;
    usuario: string;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    rol: 'cliente' | 'propietario' | 'admin';
    estado: 'activo' | 'inactivo' | 'en_verificacion' | 'suspendido';
}