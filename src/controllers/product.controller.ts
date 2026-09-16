import type { Request, Response } from 'express';
import { ProductModel } from '../models/product.model.js';
import type { LangRequest } from '../middleware/lang.middleware.js';
import { handleError } from '../utils/handleError.js';
import { uploadMultipleImages } from '../utils/uploadMultipleImages.js';
import { groupFilesByVariant, uploadVariantesImages } from '../utils/variantImages.util.js';
import { checkVariantesDuplicadas } from '../utils/validateVariantes.util.js';
import { generarDatosProductoDesdeImagenes } from '../config/groqProductService.js';
import { CategoryModel } from '../models/category.model.js';
import { deleteMultipleFromCloudinary } from '../utils/deleteFromCloudinary.js';


const VARIANTE_IMAGENES_REGEX = /^variante_(\d+)_imagenes$/;
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createProduct = async (req: LangRequest, res: Response) => {
    try {
        const { nombre, marca, talla, categoria, lote, stock, precioMercado, costo, genero, descripcion, variantes, activo } = req.body;


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
            talla,
            categorias: categoria,
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

//  para el inventario admin
export const listProducts = async (req: Request, res: Response) => {
    try {
        const products = await ProductModel.find({ activo: true })
            .select('marca nombre costo precioMercado stock talla activo imagenes estado')
            .populate({ path: 'lote', select: 'numLot estado' })
            .populate({ path: 'categorias', select: 'nombre' })
            .lean(); // para optimizar, solo trae datos no metodos de mongoose

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
        const {
            nombre,
            marca,
            talla,
            categoria,
            lote,
            stock,
            precioMercado,
            costo,
            genero,
            descripcion,
            activo,
            imagenesExistentes
        } = req.body;

        const productoActual = await ProductModel.findById(req.params.id);
        if (!productoActual) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const files = req.files as Express.Multer.File[] | undefined;
        let nuevasImagenes: string[] = [];

        if (files && files.length > 0) {
            const productoFiles = files.filter(f => f.fieldname === 'imagenes');
            if (productoFiles.length > 0) {
                const { imagenes } = await uploadMultipleImages(productoFiles, 'productos');
                nuevasImagenes = imagenes;
            }
        }

        let conservadas: string[] = [];
        if (imagenesExistentes !== undefined) {
            try {
                conservadas = typeof imagenesExistentes === 'string'
                    ? JSON.parse(imagenesExistentes)
                    : imagenesExistentes;
            } catch {
                conservadas = Array.isArray(imagenesExistentes) ? imagenesExistentes : [imagenesExistentes];
            }

            // Eliminar de Cloudinary las imagenes que estaban antes pero fueron descartadas
            const imagenesAnteriores = productoActual.imagenes || [];
            const imagenesAEliminar = imagenesAnteriores.filter(url => !conservadas.includes(url));
            if (imagenesAEliminar.length > 0) {
                await deleteMultipleFromCloudinary(imagenesAEliminar);
            }
        }

        const updateData: any = {};
        if (nombre !== undefined) updateData.nombre = nombre.trim();
        if (marca !== undefined) updateData.marca = marca;
        if (talla !== undefined) updateData.talla = talla;
        if (lote !== undefined) updateData.lote = lote;
        if (categoria !== undefined) updateData.categorias = [categoria];
        if (genero !== undefined) updateData.genero = genero;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (stock !== undefined) updateData.stock = Number(stock);
        if (costo !== undefined) updateData.costo = Number(costo);
        if (precioMercado !== undefined) updateData.precioMercado = Number(precioMercado);
        if (activo !== undefined) updateData.activo = activo === true || activo === 'true';

        if (imagenesExistentes !== undefined || nuevasImagenes.length > 0) {
            updateData.imagenes = [...conservadas, ...nuevasImagenes];
        }

        const product = await ProductModel.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.json(product);
    } catch (error) {
        console.error('Error en updateProduct:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
};

// Eliminar producto por completo: primero elimina imagenes de Cloudinary y luego elimina el documento en BD
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // 1. Eliminar imagenes de Cloudinary antes de eliminar en la BD
        const imagenesAEliminar: string[] = [];
        if (product.imagenes && product.imagenes.length > 0) {
            imagenesAEliminar.push(...product.imagenes);
        }
        if (product.variantes && product.variantes.length > 0) {
            for (const v of product.variantes) {
                if (v.imagenes && v.imagenes.length > 0) {
                    imagenesAEliminar.push(...v.imagenes);
                }
            }
        }

        if (imagenesAEliminar.length > 0) {
            await deleteMultipleFromCloudinary(imagenesAEliminar);
        }

        // 2. Eliminar el producto por completo de la base de datos
        await ProductModel.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product and images deleted completely', id: req.params.id });
    } catch (error) {
        console.error('Error en deleteProduct:', error);
        res.status(500).json({ error: 'Error deleting product' });
    }
};


export const rellenarDatosImagen = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        const primerArchivo = files?.[0];
        if (!primerArchivo) {
            return res.status(400).json({ message: 'Debes subir al menos una imagen' });
        }

        const datosIA = await generarDatosProductoDesdeImagenes(
            files.map((f) => f.buffer),
            primerArchivo.mimetype
        );

        // Mapear las categorías sugeridas (texto) a ObjectId reales de tu colección Category.
        const categoriasEncontradas = await CategoryModel.find({
            nombre: { $in: datosIA.categoriasSugeridas.map((c) => new RegExp(c, "i")) },
        }).select("_id nombre");


        const categoriaEncontrada = await CategoryModel.findOne({
            nombre: { $eq: datosIA.categoria },
        }).select("_id nombre");

        res.json({
            nombre: datosIA.nombre,
            marca: datosIA.marca,
            genero: datosIA.genero,
            descripcion: datosIA.descripcion,
            talla: datosIA.talla,
            categorias: categoriasEncontradas.map((c) => c._id),
            categoria: categoriaEncontrada?._id || null
        });

    } catch (error) {
        console.error('Error generando datos desde imagen:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
};