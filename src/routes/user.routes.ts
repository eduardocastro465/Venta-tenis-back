import { Router } from "express";
import { createUser, deleteUser, getUserById, getUserEmail,updateUser ,getUserList, updateFotoPerfil , updateEmail, updatePhone } from "../controllers/user.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get('/', getUserList);
router.get('/email/:correo', getUserEmail);
router.get('/:id', getUserById);
router.post('/', upload.single('fotoPerfil'), createUser);
router.put('/:id', updateUser);
router.put('/:id/img', upload.single('fotoPerfil'), updateFotoPerfil);
router.put('/:id/email', updateEmail);
router.put('/:id/phone', updatePhone);
router.delete('/:id', deleteUser);

export default router;