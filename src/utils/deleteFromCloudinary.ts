import cloudinary from '../config/cloudinary.js';

/**
 * Extrae el public_id de una URL de Cloudinary
 * Ejemplo: https://res.cloudinary.com/.../image/upload/v12345/productos/abc.webp -> productos/abc
 */
export const extraerPublicIdDeCloudinary = (url: string): string | null => {
    try {
        if (!url || typeof url !== 'string') return null;
        const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
        const match = url.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Elimina una imagen de Cloudinary usando su URL
 */
export const deleteFromCloudinary = async (url: string): Promise<boolean> => {
    const publicId = extraerPublicIdDeCloudinary(url);
    if (!publicId) return false;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error(`Error al eliminar imagen de Cloudinary (${publicId}):`, error);
        return false;
    }
};

/**
 * Elimina multiples imagenes de Cloudinary a partir de un arreglo de URLs
 */
export const deleteMultipleFromCloudinary = async (urls: string[]): Promise<void> => {
    if (!urls || urls.length === 0) return;
    const tareas = urls.map(url => deleteFromCloudinary(url));
    await Promise.allSettled(tareas);
};
