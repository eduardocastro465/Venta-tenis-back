import type { Request, Response } from 'express';
import { ProductModel } from '../models/product.model.js';
import type { LangRequest } from '../middleware/lang.middleware.js';
import { handleError } from '../utils/handleError.js';
import { uploadMultipleImages } from '../utils/uploadMultipleImages.js';
import { groupFilesByVariant, uploadVariantesImages } from '../utils/variantImages.util.js';
import { checkVariantesDuplicadas } from '../utils/validateVariantes.util.js';


const VARIANTE_IMAGENES_REGEX = /^variante_(\d+)_imagenes$/;
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createProduct = async (req: LangRequest, res: Response) => {
    try {
        const { nombre, lote, stock, marca, precioMercado, costo, categorias, genero, descripcion, variantes, activo } = req.body;

        // Buscamos si existe el mismo producto ya resgitrado en el mismo lote
        const existingProduct = await ProductModel.findOne({
            nombre: { $regex: `^${escapeRegex(nombre.trim())}$`, $options: 'i' },
            ...(marca ? { marca: { $regex: `^${escapeRegex(marca.trim())}$`, $options: 'i' } } : {}),
            lote,
        });

        if (existingProduct) {
            return res.status(409).json({ message: 'Ya existe un producto con ese nombre y marca, en el mismo lote' });
        }

        let variantesParsed: any[] = [];
        if (variantes) {
            // Convertir variantes string a objeto
            try {
                variantesParsed = JSON.parse(variantes);
            } catch {
                return res.status(400).json({ message: 'El formato de variantes no es válido' });
            }

            const { hayDuplicados, coloresDuplicados } = checkVariantesDuplicadas(variantesParsed);
            if (hayDuplicados) {
                return res.status(400).json({
                    message: 'Hay variantes duplicadas (mismo colorPrincipal)',
                    coloresDuplicados,
                });
            }
        }

        const files = req.files as Express.Multer.File[];
        if (!files?.length) {
            return res.status(400).json({ message: 'Debes subir al menos una imagen' });
        }

        const productoFiles = files.filter(f => f.fieldname === 'imagenes');
        const variantesFilesMap = groupFilesByVariant(files, VARIANTE_IMAGENES_REGEX);

        const { imagenes, errores } = await uploadMultipleImages(productoFiles, 'productos');

        if (imagenes.length === 0 && productoFiles.length > 0) {
            return res.status(400).json({ message: 'No se pudo subir ninguna imagen del producto', errores });
        }

        const erroresVariantes = await uploadVariantesImages(
            variantesParsed,
            variantesFilesMap,
            'productos/variantes'
        );
        const hayAdvertencias = errores.length > 0 || erroresVariantes.length > 0;

        const newProduct = new ProductModel({
            nombre: nombre.trim(),
            marca,
            lote,
            categorias: JSON.parse(categorias),
            genero,
            descripcion,
            precioMercado,
            costo,
            stock,
            imagenes,
            variantes: variantesParsed,
            activo
        });

        await newProduct.save();
        res.status(201).json({
            producto: newProduct,
            ...(hayAdvertencias && {
                advertencia: 'Algunas imágenes no se pudieron subir',
                errores,
                erroresVariantes,
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
            { returnDocument: 'after' }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted', product });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};