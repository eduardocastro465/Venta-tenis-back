import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
    id: string;
    nombre: string;
    email: string;
    rol: 'cliente' | 'admin';
}

const userSchema = new Schema<IUser>({
    id: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rol: { type: String, enum: ['cliente', 'propietario', 'admin'], default: 'cliente' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);