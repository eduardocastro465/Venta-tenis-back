import mongoose, { Schema } from 'mongoose';
import type { IVenta } from '../interface/ventas.interface.js';

const ventaSchema = new Schema<IVenta>({
    idUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productos: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        required: true,
    },
    metodoPago: { type: String, required: true },
    referencia: { type: String },
    monto: { type: Number, required: true },
});

export const VentaModel = mongoose.model<IVenta>('Venta', ventaSchema);
