import type { Types } from "mongoose";

export type TipoPago = "Contado" | "Abonos";
export type MedioPago = "Efectivo" | "Transferencia";
export type EstadoVenta = "pagado" | "pendiente" | "cancelado";

export interface IAbono {
    monto: number;
    medioPago: MedioPago;
    fecha: Date;
    folio?: string;
}

export interface IVenta {
    idUser: Types.ObjectId;
    productos: Types.ObjectId[];
    tipoPago: TipoPago;
    numeroMontos: number;
    montoPagado: number;
    totalAPagar: number;
    fecha: Date;
    estado: EstadoVenta;
    abonos: IAbono[];
}