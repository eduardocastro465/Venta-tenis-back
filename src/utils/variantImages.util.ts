import { uploadMultipleImages } from './uploadMultipleImages.js';
import type { VarianteConImagenes } from '../interface/upload.interface.js';

// Agrupa los archivos por variante
export const groupFilesByVariant = (files: Express.Multer.File[],
    nombreRegex: RegExp,
): Map<number, Express.Multer.File[]> => {
    const variantesFilesMap = new Map<number, Express.Multer.File[]>();

    files.forEach(f => {
        const match = f.fieldname.match(nombreRegex);
        if (match) {
            const idx = Number(match[1]);
            if (!variantesFilesMap.has(idx)) variantesFilesMap.set(idx, []);
            variantesFilesMap.get(idx)!.push(f);
        }
    });

    return variantesFilesMap;
};


// sube las imagenes de las variantes a cloudinary
export const uploadVariantesImages = async (
    variantesParsed: VarianteConImagenes[],
    variantesFilesMap: Map<number, Express.Multer.File[]>,
    folder: string
) => {
    const erroresVariantes: { variante: number; errores: any[] }[] = [];

    for (const [i, variante] of variantesParsed.entries()) {
        const filesDeVariante = variantesFilesMap.get(i) || [];
        if (filesDeVariante.length === 0) continue;

        const resultado = await uploadMultipleImages(filesDeVariante, folder);
        variante.imagenes = resultado.imagenes;

        if (resultado.errores.length > 0) {
            erroresVariantes.push({ variante: i, errores: resultado.errores });
        }
    }

    return erroresVariantes;
};