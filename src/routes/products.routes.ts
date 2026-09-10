// routes/usuarios.routes.ts
import { Router } from 'express';
import { createProduct, deleteProduct, getProduct, listProducts, rellenarDatosImagen, updateProduct } from '../controllers/product.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', upload.any(), createProduct);
router.post('/rellenarDatosImagen', upload.any(), rellenarDatosImagen);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;