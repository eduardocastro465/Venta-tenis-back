import type { Request, Response } from "express";
import { UserModel } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";



export const getUserList = async (req: Request, res: Response) => {
    try {
        const users = await UserModel.find();
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener la lista de usuarios", error });
    }
}

export const getUserEmail = async (req: Request, res: Response) => {
    try {
        const { correo } = req.params;

        if (!correo) {
            return res.status(400).json({ message: "El correo es requerido" });
        }

        const user = await UserModel.findOne({ correo });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el usuario", error });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el usuario", error });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { usuario, nombre, apellido } = req.body;

        const user = await UserModel.findByIdAndUpdate(id, { usuario, nombre, apellido }, { returnDocument: 'after' });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json({ message: "Usuario actualizado exitosamente", user });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el usuario", error });
    }
}
export const updateEmail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { correo } = req.body;

        const user = await UserModel.findByIdAndUpdate(id, { correo }, { returnDocument: 'after' });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json({ message: "Correo actualizado exitosamente", user });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el correo", error });
    }
}
export const updatePhone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { telefono } = req.body;

        const user = await UserModel.findByIdAndUpdate(id, { telefono }, { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json({ message: "Telefono actualizado exitosamente", user });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el telefono", error });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "Usuario eliminado exitosamente", user });
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar el usuario", error });
    }
}

export const updateFotoPerfil = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "Imagen es requerida" });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'users');

        if (!result) {
            return res.status(500).json({ message: "Error al subir la imagen" });
        }

        console.log(result);

        const user = await UserModel.findByIdAndUpdate(
            id,
            { fotoPerfil: result },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json({ message: "Imagen actualizada exitosamente", user });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar la imagen", error });
    }
}