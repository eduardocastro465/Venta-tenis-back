import { Router } from "express";
import { getFilteredProducts,getAvailableFilters } from "../controllers/filters.controller.js";

const router = Router();

router.get('/getAvailableFilters', getAvailableFilters );
router.get('/getFilteredProducts', getFilteredProducts );

export default router;