import mongoose, { Schema } from 'mongoose';
import type { IUser } from '../interface/user.interface.js';

const userSchema = new Schema<IUser>({
    fotoPerfil: { type: String, default: '' },
    usuario: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    apellido: {
        type: String
    },
    telefono: { type: String, required: true, unique: true },
    correo: { type: String, required: true, unique: true },
    rol: { type: String, enum: ['cliente', 'propietario', 'admin'], default: 'cliente' },
    estado: { type: String, enum: ['activo', 'inactivo', 'en_verificacion', 'suspendido'], default: 'en_verificacion' },
}, { timestamps: true });

userSchema.index({ estado: 1 })

export const UserModel = mongoose.model<IUser>('User', userSchema);