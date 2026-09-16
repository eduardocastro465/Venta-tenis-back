import type { Request, Response } from 'express';
import { VentaModel } from "../models/ventas.model.js";
import { ProductModel } from "../models/product.model.js";

export const createSale = async (req: Request, res: Response) => {
    try {
        const {
            idProductos,
            cliente,
            telefonoCliente,
            tipoPago,
            numeroMontos = 1,
            montoPagado,
            totalAPagar,
            estado,
            abonos = [],
            idUser,
            diasApartado,
            fechaLimiteApartado,
        } = req.body;

        if (!idProductos || !Array.isArray(idProductos) || idProductos.length === 0) {
            return res.status(400).json({ error: 'Se requiere al menos un producto para la venta' });
        }

        const montoFinalPagado = Number(montoPagado ?? 0);
        const montoTotalAPagar = Number(totalAPagar ?? 0);

        const estadoCalculado =
            estado || (tipoPago === 'Contado' || montoFinalPagado >= montoTotalAPagar ? 'pagado' : 'pendiente');

        let fechaLimiteFinal: Date | null = null;
        let diasFinal = Number(diasApartado) || 0;

        if (tipoPago === 'Apartado') {
            if (fechaLimiteApartado) {
                fechaLimiteFinal = new Date(fechaLimiteApartado);
            } else if (diasFinal > 0) {
                const f = new Date();
                f.setDate(f.getDate() + diasFinal);
                fechaLimiteFinal = f;
            } else {
                diasFinal = 15;
                const f = new Date();
                f.setDate(f.getDate() + 15);
                fechaLimiteFinal = f;
            }
        }

        const venta = new VentaModel({
            idProductos,
            cliente: cliente || 'Cliente Mostrador',
            telefonoCliente: telefonoCliente || '',
            tipoPago,
            numeroMontos: Number(numeroMontos) || 1,
            montoPagado: montoFinalPagado,
            totalAPagar: montoTotalAPagar,
            estado: estadoCalculado,
            abonos,
            fechaLimiteApartado: fechaLimiteFinal,
            diasApartado: diasFinal,
            idUser: idUser || null,
        });

        await venta.save();

        // Descontar inventario de los productos vendidos
        await ProductModel.updateMany(
            { _id: { $in: idProductos } },
            { $inc: { stock: -1 } }
        );

        // Desactivar aquellos productos cuyo stock haya llegado a 0
        await ProductModel.updateMany(
            { _id: { $in: idProductos }, stock: { $lte: 0 } },
            { $set: { activo: false } }
        );

        const ventaPoblada = await VentaModel.findById(venta._id).populate('idProductos');

        res.status(201).json(ventaPoblada);
    } catch (error) {
        console.error("Error al crear venta:", error);
        res.status(500).json({ error: 'Error creating sale' });
    }
};

export const listSales = async (req: Request, res: Response) => {
    try {
        const ventas = await VentaModel.find()
            .populate('idProductos')
            .sort({ createdAt: -1 });
        res.json(ventas);
    } catch (error) {
        console.error("Error al listar ventas:", error);
        res.status(500).json({ error: 'Error fetching sales' });
    }
};

export const getSale = async (req: Request, res: Response) => {
    try {
        const venta = await VentaModel.findById(req.params.id).populate('idProductos');
        if (!venta) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json(venta);
    } catch (error) {
        console.error("Error al obtener venta:", error);
        res.status(500).json({ error: 'Error fetching sale' });
    }
};

export const updateSale = async (req: Request, res: Response) => {
    try {
        const saleId = req.params.id || req.body.id;
        const { abono, estado } = req.body;

        const ventaActual = await VentaModel.findById(saleId);
        if (!ventaActual) {
            return res.status(404).json({ error: "Sale not found" });
        }

        const updateData: Record<string, any> = {};

        if (abono && typeof abono.monto === 'number') {
            const nuevoAbono = {
                monto: Number(abono.monto),
                medioPago: abono.medioPago || 'Efectivo',
                fecha: abono.fecha || new Date(),
                folio: abono.folio || '',
            };

            const nuevoMontoPagado = Number(ventaActual.montoPagado || 0) + nuevoAbono.monto;
            const nuevoEstado = nuevoMontoPagado >= ventaActual.totalAPagar ? 'pagado' : 'pendiente';

            updateData.$push = { abonos: nuevoAbono };
            updateData.$set = {
                montoPagado: nuevoMontoPagado,
                estado: nuevoEstado,
            };
        } else if (estado) {
            updateData.$set = { estado };
        }

        const ventaActualizada = await VentaModel.findByIdAndUpdate(
            saleId,
            updateData,
            { new: true, runValidators: true }
        ).populate('idProductos');

        res.json(ventaActualizada);
    } catch (error) {
        console.error("Error al actualizar venta:", error);
        res.status(500).json({ error: 'Error updating sale' });
    }
};
