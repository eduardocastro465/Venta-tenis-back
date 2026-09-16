import { Router } from "express";
import { createOfertas, deleteOfertas, getOfertas, updateOfertas } from "../controllers/ofertas.controller.js";

const router = Router();

router.post('/', createOfertas);
router.put('/:id', updateOfertas);
router.delete('/:id', deleteOfertas);
router.get('/', getOfertas);

export default router;