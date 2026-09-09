import mongoose, { Schema } from 'mongoose';
import type { IProduct, IVariante } from '../interface/products.interface.js';

const varianteSchema = new Schema<IVariante>({
    colorPrincipal: { type: String, required: true },
    coloresSecundarios: { type: [String] },
    stock: { type: Number, required: true, default: 0, min: 0 },
}, { _id: false });


const productSchema = new Schema<IProduct>({
    nombre: { type: String, required: true, trim: true },
    marca: { type: String },
    lote: {
        type: Schema.Types.ObjectId,
        ref: 'Lot',
        required: true
    },
    categorias: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }],
    genero: { type: String, enum: ['hombre', 'mujer', 'unisex'], required: true },
    descripcion: { type: String, default: '' },
    talla: { type: String, default: "", trim: true },
    costo: { type: Number, min: 1, required: true },
    precioMercado: { type: Number, min: 1, required: true },
    imagenes: { type: [String], default: [] },
    variantes: { type: [varianteSchema], default: [] },
    activo: { type: Boolean, default: true }
}, { timestamps: true });


productSchema.index({ nombre: 1, marca: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } }); //protege del duplicado

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);