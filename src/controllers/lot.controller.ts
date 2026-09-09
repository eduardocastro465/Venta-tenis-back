import type { Request, Response } from "express";
import { LotModel } from "../models/lots.model.js";

export const getAllLots = async (req: Request, res: Response) => {
    try {
        const lots = await LotModel.find();
        res.status(200).json(lots);
    } catch (error) {
        console.error('Error al obtener los lotes:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const createLot = async (req: Request, res: Response) => {
    try {

        const { mercancia, viaticos, gasolina, otros } = req.body;

        //crea la secuencia del lote $numero secuencial , dia, mes y año
        const date = new Date();
        const sequence = await LotModel.countDocuments() + 1;
        const numLot = `LOTE-${sequence}-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        const lot = new LotModel({
            numLot,
            estado: 'activo',
            desgloseInversion: { mercancia, viaticos, gasolina, otros }
        });

        await lot.save();
        res.status(201).json(lot);

    } catch (error) {
        console.error('Error al crear el lote:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const updateStateLot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const lot = await LotModel.findById(id);
        if (!lot) {
            return res.status(404).json({ message: 'Lote no encontrado' });
        }

        if (estado) {
            lot.estado = estado;
            await lot.save();
            return res.status(200).json({ message: 'Estado del lote actualizado correctamente' });
        }

        res.status(400).json({ message: 'Estado del lote no actualizado' });

    } catch (error) {
        console.error('Error al actualizar el estado del lote:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const updateInversionLot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { mercancia, viaticos, gasolina, otros } = req.body;

        const lot = await LotModel.findById(id);

        if (!lot) {
            return res.status(404).json({ message: 'Lote no encontrado' });
        }

        //actualiza el desglose de inversion del lote si se envia un valor
        if (mercancia) {
            lot.desgloseInversion.mercancia = mercancia;
        }

        if (viaticos) {
            lot.desgloseInversion.viaticos = viaticos;
        }

        if (gasolina) {
            lot.desgloseInversion.gasolina = gasolina;
        }

        if (otros) {
            lot.desgloseInversion.otros = otros;
        }

        await lot.save();

        return res.status(200).json({ message: 'Desglose de inversion actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar el desglose de inversion del lote:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const deleteLot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const lot = await LotModel.findById(id);
        if (!lot) {
            return res.status(404).json({ message: 'Lote no encontrado' });
        }

        lot.estado = 'inactivo';
        await lot.save();

        res.status(200).json(lot);

    } catch (error) {
        console.error('Error al desactivar el lote:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}