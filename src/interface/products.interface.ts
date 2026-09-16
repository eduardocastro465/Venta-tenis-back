import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
    nombre: string;
    camposRequeridos: ICamposRequeridos;
    active: boolean;
}

export interface ICamposRequeridos {
    nombre: boolean;
    marca: boolean;
    genero: boolean;
    descripcion: boolean;
    talla: boolean;
    stock: boolean;
    precioMercado: boolean;
    costo: boolean;
    imagenes: boolean;
    variantes: boolean;
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
    ofertas: Types.ObjectId[];
    genero: string;
    descripcion: string;
    talla?: string;
    stock: number;
    costo: number;
    precioMercado: number;
    imagenes: string[];
    variantes?: IVariante[];
    activo?: boolean;
}

export interface IOferta extends Document {
    nombre: string;
    idProductos: Types.ObjectId[];
    tipoDescuento: 'porcentaje' | 'fijo';
    valorDescuento: number;
    activo: boolean;
}

export interface DatosProductoIA {
    nombre: string;
    marca: string | null;
    genero: "hombre" | "mujer" | "unisex";
    descripcion: string;
    talla: string;
    categoria: string;
    categoriasSugeridas: string[];
}