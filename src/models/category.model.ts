import mongoose, { Schema } from 'mongoose';
import type { ICategory } from '../interface/products.interface.js';


const categorySchema = new Schema<ICategory>({
    nombre: { type: String, required: true, unique: true },
}, { timestamps: true });


export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);