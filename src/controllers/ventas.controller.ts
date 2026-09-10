
import type { Request, Response } from 'express';
import { VentaModel } from "../models/ventas.model.js";


export const createSale = async (req: Request, res: Response) => {
    try {
        const { productos, tipoPago, medioPago, numeroMontos, montoPagado, totalAPagar, estado, abonos } = req.body;
        const venta = new VentaModel({ productos, tipoPago, medioPago, numeroMontos, montoPagado, totalAPagar, estado, abonos });
        await venta.save();
        res.status(201).json(venta);
    } catch (error) {
        res.status(500).json({ error: 'Error creating sale' });
    }
};

export const listSales = async (req: Request, res: Response) => {
    try {
        const ventas = await VentaModel.find();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sales' });
    }
};

export const getSale = async (req: Request, res: Response) => {
    try {
        const venta = await VentaModel.findById(req.params.id);
        if (!venta) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json(venta);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sale' });
    }
};

export const updateSale = async (req: Request, res: Response) => {
    try {

        const { id, abono } = req.body;

        const ventaActual = await VentaModel.findById(id);
        if (!ventaActual) {
            return res.status(404).json({ error: "Sale not found" });
        }

        const nuevoMontoPagado = ventaActual.montoPagado + abono.monto;
        const nuevoEstado = nuevoMontoPagado >= ventaActual.totalAPagar ? "pagado" : "pendiente";

        const venta = await VentaModel.findByIdAndUpdate(
            id,
            {
                $push: { abonos: abono },
                $set: {
                    montoPagado: nuevoMontoPagado,
                    estado: nuevoEstado,
                },
            },
            { new: true, runValidators: true }
        );

        res.json(venta);
    } catch (error) {
        res.status(500).json({ error: 'Error updating sale' });
    }
};
