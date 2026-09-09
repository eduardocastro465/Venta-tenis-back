import type { LangRequest } from "../middleware/lang.middleware.js";
import { type Response } from "express";
import { ProductModel } from "../models/product.model.js";
import { CategoryModel } from "../models/category.model.js";

export const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getAvailableFilters = async (req: LangRequest, res: Response) => {
    try {
        const categorias = await CategoryModel.distinct('nombre').sort({ nombre: 1 });
        const marcas = await ProductModel.distinct('marca').sort({ marca: 1 });

        const preciosMinMax = await ProductModel.aggregate([
            { $match: { activo: true } },
            { $group: {
                _id: null,
                min: { $min: '$precioMercado' },
                max: { $max: '$precioMercado' }
            }}
        ]);

        const minPrecio = preciosMinMax[0]?.min ?? 0;
        const maxPrecio = preciosMinMax[0]?.max ?? 0;

        res.json({
            categorias,
            marcas,
            precios: {
                min: minPrecio,
                max: maxPrecio
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener filtros' });
    }
};

export const getFilteredProducts = async (req: LangRequest, res: Response) => {
    const { genero, marca, categoria, precioMin, precioMax, activo } = req.query;

    const filtro: any = {};
    if (genero) filtro.genero = genero;
    if (marca) filtro.marca = { $regex: escapeRegex(marca as string), $options: 'i' };
    if (categoria) filtro.categorias = categoria;
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (precioMin || precioMax) {
        filtro.precioMercado = {};
        if (precioMin) filtro.precioMercado.$gte = Number(precioMin);
        if (precioMax) filtro.precioMercado.$lte = Number(precioMax);
    }

    const productos = await ProductModel.find(filtro).populate('categorias');
    res.status(200).json(productos);
};