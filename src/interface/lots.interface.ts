import { Types } from 'mongoose';

export interface IInvestmentBreakdown {
    mercancia: number;
    viaticos: number;
    gasolina: number;
    otros: number;
}

export interface ILot {
    numLot: String;
    productId: Types.ObjectId;
    estado:string;
    desgloseInversion: IInvestmentBreakdown;
    totalRecuperado?: number;
    ganancias?: number;
    fechaDeRegistro: Date;
}