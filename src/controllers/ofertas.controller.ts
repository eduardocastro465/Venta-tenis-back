import type { Response } from 'express';
import type { LangRequest } from '../middleware/lang.middleware.js';
import { OfertasModel } from '../models/ofertas.model.js';
import { handleError } from '../utils/handleError.js';

export const createOfertas = async (req: LangRequest, res: Response) => {
    try {
        const { nombre, idProductos, tipoDescuento, valorDescuento, activo } = req.body;

        const existingOfertas = await OfertasModel.findOne({
            nombre: { $regex: `^${nombre.trim()}$`, $options: 'i' },
        });

        if (existingOfertas) {
            return res.status(409).json({ message: 'Ya existe una oferta con ese nombre' });
        }

        const newOfertas = new OfertasModel({
            nombre,
            idProductos,
            tipoDescuento,
            valorDescuento,
            activo,
        });

        await newOfertas.save();
        res.status(201).json({ message: 'Oferta creada exitosamente' });
    } catch (error: any) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Oferta duplicada' });
        }
        handleError(error, res, req.msg, 'Error creating offer');
    }
};

export const updateOfertas = async (req: LangRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, idProductos, tipoDescuento, valorDescuento, activo } = req.body;

        const existingOfertas = await OfertasModel.findOne({
            nombre: { $regex: `^${nombre.trim()}$`, $options: 'i' },
            _id: { $ne: id as any },
        });

        if (existingOfertas) {
            return res.status(409).json({ message: 'Ya existe una oferta con ese nombre' });
        }

        const updatedOfertas = await OfertasModel.findByIdAndUpdate(
            id,
            {
                nombre,
                idProductos,
                tipoDescuento,
                valorDescuento,
                activo,
            },
            { new: true, runValidators: true }
        );

        if (!updatedOfertas) {
            return res.status(404).json({ message: 'Oferta no encontrada' });
        }

        res.status(200).json({ message: 'Oferta actualizada exitosamente', data: updatedOfertas });
    } catch (error: any) {
        console.log(error);
        handleError(error, res, req.msg, 'Error updating offer');
    }
};

export const deleteOfertas = async (req: LangRequest, res: Response) => {
    try {
        const { id } = req.params;

        const deletedOfertas = await OfertasModel.findByIdAndDelete(id);

        if (!deletedOfertas) {
            return res.status(404).json({ message: 'Oferta no encontrada' });
        }

        res.status(200).json({ message: 'Oferta eliminada exitosamente' });
    } catch (error: any) {
        console.log(error);
        handleError(error, res, req.msg, 'Error deleting offer');
    }
};

export const getOfertas = async (req: LangRequest, res: Response) => {
    try {
        const ofertas = await OfertasModel.find();
        res.status(200).json({ data: ofertas });
    } catch (error: any) {
        console.log(error);
        handleError(error, res, req.msg, 'Error getting offers');
    }
};