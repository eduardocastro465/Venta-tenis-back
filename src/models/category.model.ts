import mongoose, { Schema } from 'mongoose';
import type { ICategory, ICamposRequeridos } from '../interface/products.interface.js';

const camposRequeridosSchema = new Schema<ICamposRequeridos>({
    nombre: { type: Boolean, default: true },
    marca: { type: Boolean, default: true },
    genero: { type: Boolean, default: true },
    descripcion: { type: Boolean, default: true },
    talla: { type: Boolean, default: true },
    stock: { type: Boolean, default: true },
    precioMercado: { type: Boolean, default: true },
    costo: { type: Boolean, default: true },
    imagenes: { type: Boolean, default: true },
    variantes: { type: Boolean, default: true },
});

const categorySchema = new Schema<ICategory>({
    nombre: { type: String, required: true, unique: true },
    camposRequeridos: { type: camposRequeridosSchema, required: true },
}, { timestamps: true });


export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);