// routes/usuarios.routes.ts
import { Router } from 'express';
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../controllers/product.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', upload.any(), createProduct);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;