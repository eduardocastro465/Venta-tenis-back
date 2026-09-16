import type {  Response } from 'express';
import type { LangRequest } from '../middleware/lang.middleware.js';
import { ProductModel } from '../models/product.model.js';
import { CategoryModel } from '../models/category.model.js';
import { handleError } from '../utils/handleError.js';

export const createCategory = async (req: LangRequest, res: Response) => {
    try {
        const { nombre } = req.body;

        const existingCategory = await CategoryModel.findOne({
            nombre: { $regex: `^${nombre.trim()}$`, $options: 'i' },
        });

        if (existingCategory) {
            return res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
        }

        const newCategory = new CategoryModel({
            nombre: nombre.trim(),
            camposRequeridos: {
                nombre: true,
                marca: true,
                genero: true,
                descripcion: true,
                talla: true,
                stock: true,
                imagenes: true,
                variantes: true,
            }
        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error: any) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Categoría duplicada' });
        }
        handleError(error, res, req.msg, 'Error creating category');
    }
};

export const getCategories = async (req: LangRequest, res: Response) => {
    try {
        const categories = await CategoryModel.find().sort({ nombre: 1 });
        res.status(200).json(categories);
    } catch (error: any) {
        handleError(error, res, req.msg, 'Error fetching categories');
    }
};

export const getCategoryById = async (req: LangRequest, res: Response) => {
    try {
        const { id } = req.params;

        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.status(200).json(category);
    } catch (error: any) {
        handleError(error, res, req.msg, 'Error fetching category');
    }
};

export const updateCategory = async (req: LangRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, camposRequeridos } = req.body;

        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        if (nombre && nombre.trim() !== category.nombre) {
            const existingCategory = await CategoryModel.findOne({
                _id: { $ne: id as string },
                nombre: { $regex: `^${nombre.trim()}$`, $options: 'i' },
            });

            if (existingCategory) {
                return res.status(409).json({ message: 'Ya existe otra categoría con ese nombre' });
            }

            category.nombre = nombre.trim();
        }

        if (camposRequeridos && typeof camposRequeridos === 'object') {
            category.camposRequeridos = {
                ...category.camposRequeridos,
                ...camposRequeridos,
            };
        }

        await category.save();
        res.status(200).json(category);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Categoría duplicada' });
        }
        handleError(error, res, req.msg, 'Error updating category');
    }
};

export const deleteCategory = async (req: LangRequest, res: Response) => {
    try {
        const { id } = req.params;
        const productosConEstaCategoria = await ProductModel.countDocuments({ categorias: id as any });

        if (productosConEstaCategoria > 0) {
            return res.status(409).json({
                message: `No se puede eliminar: ${productosConEstaCategoria} producto(s) usan esta categoría`,
            });
        }

        const category = await CategoryModel.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.status(200).json({ message: 'Categoría eliminada' });
    } catch (error: any) {
        handleError(error, res, req.msg, 'Error deleting category');
    }
};