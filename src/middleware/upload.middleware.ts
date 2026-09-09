import multer from 'multer';

// guarda el archivo en memoria y luego lo mandamos a cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB alineado al plan gratuito de cloudinary
});