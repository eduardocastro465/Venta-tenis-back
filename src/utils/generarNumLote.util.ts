import { LotModel } from "../models/lots.model.js";

export const generarNumeroLote = async (
) => {
    // crea la secuencia del lote: número secuencial - día/mes/año
    const date = new Date();
    const sequence = await LotModel.countDocuments() + 1;

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    return `Lote ${sequence} - ${dd}/${mm}/${yyyy}`;
};