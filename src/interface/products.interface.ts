import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
    nombre: string;
}

export interface IVariante {
    colorPrincipal: string;
    coloresSecundarios?: string[];
    imagenes: string[];
    stock: number;
}

export interface IProduct extends Document {
    nombre: string;
    marca?: string;
    lote: Types.ObjectId;
    categorias: Types.ObjectId[];
    genero: string;
    descripcion: string;
    talla?: string;
    stock: number;
    precioMercado: number;
    costo: number;
    imagenes: string[];
    variantes?: IVariante[];
    activo?: boolean;
}