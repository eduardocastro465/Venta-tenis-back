import { uploadToCloudinary } from './uploadToCloudinary.js';
import type { UploadMultipleResult } from '../interface/upload.interface.js';

export const uploadMultipleImages = async (
    files: Express.Multer.File[],
    folder?: string,
): Promise<UploadMultipleResult> => {
    const resultados = await Promise.allSettled(
        files.map((file) => uploadToCloudinary(file.buffer, folder)),
    );

    const imagenes: string[] = [];
    const errores: UploadMultipleResult['errores'] = [];

    resultados.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled') {
            imagenes.push(resultado.value);
        } else {
            errores.push({
                archivo: files[index]?.originalname ?? `archivo_${index + 1}`,
                motivo: resultado.reason?.message || 'Error desconocido al subir la imagen',
            });
        }
    });

    return { imagenes, errores };
};