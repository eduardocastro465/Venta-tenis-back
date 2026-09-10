import mongoose, { Schema, Types } from 'mongoose';
import type { IVenta } from '../interface/ventas.interface.js';


const ventaSchema = new Schema<IVenta>({
    idUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productos: {
        type: [Schema.Types.ObjectId],
        ref: 'Product',
        required: true,
    },
    tipoPago: {
        type: String,
        enum: ["Contado", "Abonos"],
        required: true,
    },
    abonos: [{
        monto: { type: Number, required: true },
        medioPago: {
            type: String,
            enum: ["Efectivo", "Transferencia"],
            required: true,
        },
        fecha: { type: Date, required: true, default: Date.now },
        folio: { type: String }, // null si es efectivo
    }],
    numeroMontos: { type: Number, required: true },
    montoPagado: { type: Number, required: true },
    totalAPagar: { type: Number, required: true },
    estado: {
        type: String,
        enum: ["pagado", "pendiente", "cancelado"],
        default: "pendiente",
        required: true,
    },
}, { _id: true });

export const VentaModel = mongoose.model<IVenta>('Venta', ventaSchema);
