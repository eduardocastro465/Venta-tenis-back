import mongoose from 'mongoose';

export interface ICategory extends Document {
    nombre: string;
}

export interface IVariante {
    tallas: number;
    colorPrincipal: string;
    coloresSecundarios?: string[];
    stock: number;
}

export interface IProduct extends Document {
    nombre: string;
    marca?: string;
    lote: mongoose.Types.ObjectId;
    categorias: mongoose.Types.ObjectId;
    genero: string;
    descripcion: string;
    talla: string;
    precioMercado: number;
    costo: number;
    imagenes: string[];
    variantes: IVariante[];
    activo?: boolean;
    stockTotal: number;
    vistas: number;
}