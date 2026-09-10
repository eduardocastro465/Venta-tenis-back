import { Router } from "express";
import { createSale, getSale, listSales, updateSale } from "../controllers/ventas.controller.js";

const router = Router();

router.post('/', createSale);
router.get('/', listSales);
router.get('/:id', getSale);
router.put('/:id', updateSale);

export default router;