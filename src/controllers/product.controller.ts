import type { Request, Response } from 'express';
import { ProductModel } from '../models/product.model.js';
import type { LangRequest } from '../middleware/lang.middleware.js';
import { handleError } from '../utils/handleError.js';
import { uploadMultipleImages } from '../utils/uploadMultipleImages.js';

export const createProduct = async (req: LangRequest, res: Response) => {
    try {
        const { nombre, lote, marca, categorias, genero, descripcion, precio, variantes, activo } = req.body;

        // Buscamos si existe el mismo producto ya resgitrado en el mismo lote
        const existingProduct = await ProductModel.findOne({
            nombre: { $regex: `^${nombre.trim()}$`, $options: 'i' },
            marca: { $regex: `^${marca.trim()}$`, $options: 'i' },
            lote: { $regex: `${lote.trim()}`, $options: 'i' }
        });

        if (existingProduct) {
            return res.status(409).json({ message: 'Ya existe un producto con ese nombre y marca, en el mismo lote' });
        }

        // Evitamos variantes duplicadas dentro de un mismo producto
        if (variantes?.length) {
            const claves = variantes.map((v: any) => JSON.stringify({ color: v.color, talla: v.talla }));
            const claveSet = new Set(claves);
            if (claveSet.size !== claves.length) {
                return res.status(400).json({ message: 'Hay variantes duplicadas (misma combinación de color/talla)' });
            }
        }

        const files = req.files as Express.Multer.File[];

        if (!files?.length) {
            return res.status(400).json({ message: 'Debes subir al menos una imagen' });
        }

        const { imagenes, errores } = await uploadMultipleImages(files, 'productos');

        if (imagenes.length === 0) {
            return res.status(400).json({ message: 'No se pudo subir ninguna imagen', errores });
        }


        const newProduct = new ProductModel({
            nombre: nombre.trim(),
            marca,
            categorias: JSON.parse(categorias),
            genero,
            descripcion,
            precio,
            imagenes,
            variantes: variantes ? JSON.parse(variantes) : [],
            activo
        });

        await newProduct.save();
        res.status(201).json({
            producto: newProduct,
            ...(errores.length > 0 && {
                advertencia: `${errores.length} de ${files.length} imagen(es) no se pudieron subir`,
                errores,
            }),
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Producto duplicado' });
        }

        handleError(error, res, req.msg, 'Error creating product');
    }
};

export const listProducts = async (req: Request, res: Response) => {
    try {
        const products = await ProductModel.find({ activo: true });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductModel.findById(req.params.id).populate('categorias');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
};


export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
};

// Eliminar producto (borrado lógico, no físico)
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductModel.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted', product });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};