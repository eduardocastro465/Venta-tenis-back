import mongoose, { Schema } from 'mongoose';
import type { IVenta } from '../interface/ventas.interface.js';

const ventaSchema = new Schema<IVenta>({
    idUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    cliente: {
        type: String,
        default: 'Cliente Mostrador',
        trim: true,
    },
    telefonoCliente: {
        type: String,
        default: '',
        trim: true,
    },
    idProductos: {
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
        folio: { type: String, default: '' },
    }],
    numeroMontos: { type: Number, required: true, default: 1 },
    montoPagado: { type: Number, required: true },
    totalAPagar: { type: Number, required: true },
    estado: {
        type: String,
        enum: ["pagado", "pendiente", "cancelado"],
        default: "pendiente",
        required: true,
    },
}, { timestamps: true });

export const VentaModel = mongoose.model<IVenta>('Venta', ventaSchema);
