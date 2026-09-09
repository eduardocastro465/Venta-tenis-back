import mongoose, { Schema } from 'mongoose';
import type { ILot, IInvestmentBreakdown } from "../interface/lots.interface.js"


const Desgloseinversión = new Schema<IInvestmentBreakdown>({
    mercancia: {
        type: Number,
        min: 1,
        required: true
    },
    viaticos: {
        type: Number,
        min: 1,
        required: true
    },
    gasolina: {
        type: Number,
        min: 0
    },
    otros: {
        type: Number,
        min: 0
    }
});


const LotSchema = new Schema<ILot>({
    numLot: {
        type: String,
        required: true,
        unique: true
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    },
    desgloseInversion: {
        type: Desgloseinversión,
        required: true
    },
    fechaDeRegistro: {
        type: Date,
        default: Date.now
    }
});


export const LotModel = mongoose.model<ILot>('Lot', LotSchema);