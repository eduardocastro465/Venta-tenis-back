import type { Types } from "mongoose";

export interface IVenta {
    idUser: Types.ObjectId;
    productos: Types.ObjectId[];
    metodoPago: string;
    referencia?: string;
    monto: number;
}