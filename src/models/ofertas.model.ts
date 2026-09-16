import mongoose, { Schema } from 'mongoose';
import type { IOferta } from '../interface/products.interface.js';

const ofertasSchema = new Schema<IOferta>({
    nombre: { type: String, required: true, trim: true },
    idProductos: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    }],
    tipoDescuento: {
        type: String,
        enum: ['porcentaje', 'fijo'],
        required: true,
    },
    valorDescuento: {
        type: Number,
        required: true,
        min: 0,
    },
    activo: { type: Boolean, default: true },
}, { timestamps: true });

export const OfertasModel = mongoose.model<IOferta>('Ofertas', ofertasSchema);