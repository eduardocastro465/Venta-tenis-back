import { Router } from "express";
import { createLot, deleteLot, getAllLots, updateStateLot, updateInversionLot } from "../controllers/lot.controller.js";

const router = Router();

router.post('/', createLot);
router.get('/', getAllLots);
router.put('/:id/state', updateStateLot);
router.put('/:id/inversion', updateInversionLot);
router.put('/:id/delete', deleteLot);

export default router;