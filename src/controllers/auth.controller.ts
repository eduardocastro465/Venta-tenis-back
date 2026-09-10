import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import type { Request, Response } from 'express';
import { UserModel } from '../models/user.model.js';
import { createAccessToken, createRefreshToken } from '../libs/jwt.js';
import type { AuthRequest, CustomJwtPayload } from '../interface/user.interface.js';
import { JWT_REFRESH_SECRET } from '../config.js';

export const registrarUsuario = async (req: Request, res: Response) => {
    try {

        const { usuario, apellido, nombre, correo, telefono, password } = req.body

        const user = await UserModel.findOne({ correo });

        if (user) {
            return res.status(409).json({ ok: false, msg: "Correo ya registrado" });
        }

        const user2 = await UserModel.findOne({ usuario });

        if (user2) {
            return res.status(409).json({ ok: false, msg: "Usuario ya registrado" });
        }

        const SalRounds = 10;

        const salt = await bcryptjs.genSalt(SalRounds);

        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new UserModel({
            nombre,
            apellido,
            usuario,
            correo,
            contrasena: hashedPassword,
            telefono,
            rol: "cliente",
        });

        const savedUser = await newUser.save();

        const token = await createAccessToken({ id: savedUser._id, correo: savedUser.correo, rol: savedUser.rol });
        const refreshToken = await createRefreshToken({ id: savedUser._id });

        savedUser.refreshTokens.push(refreshToken);
        await savedUser.save();


        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({ ok: true, msg: "Usuario resgitrado con exito" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, msg: "Error del servidor" });
    }
};

export const Login = async (req: Request, res: Response) => {
    try {
        const { correo, password } = req.body;


        const user = await UserModel.findOne({ correo });

        if (!user) {
            return res.status(401).json({ ok: false, msg: "credenciales incorretas" });
        }

        if (user.estado === "suspendido") {
            return res.status(403).json({ ok: false, msg: "Cuenta suspendida" });
        }

        if (user.estado === "en_verificacion") {
            return res.status(403).json({ ok: false, msg: "Debes verificar tu correo antes de iniciar sesión" });
        }

        const isMatch = await bcryptjs.compare(password, user.contrasena)

        if (!isMatch) {
            return res.status(401).json({
                ok: false,
                msg: "credenciales incorretas",
            })
        }

        const token = await createAccessToken({ id: user._id, correo: user.correo, rol: user.rol, })
        const refreshToken = await createRefreshToken({ id: user._id });

        user.refreshTokens.push(refreshToken);
        await user.save();

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 min
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
        });


        return res.status(200).json({ token });
    } catch (error: any) {
        console.log({ error: error.message });
        return res.status(500).json({
            ok: false,
            mgs: "Error del servidor",
        });
    }
};


// Esta funcion se encarga de generar un nuevo token de 15 minutos cuando expire
export const refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    // Revisa si el token de 30 dias existe en las cookies
    if (!token) {
        return res.status(401).json({ ok: false, msg: "No hay sesión activa" });
    }

    // Si existe el token de 30 dias, se verifica si es valido y si el usuario existe
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as CustomJwtPayload;

        const user = await UserModel.findById(decoded.id);

        if (!user || !user.refreshTokens.includes(token)) {
            return res.status(401).json({ ok: false, msg: "Sesión inválida" });
        }

        // Genera uno nuevo y reemplaza el token viejo de 30 dias en el array
        const newRefreshToken = await createRefreshToken({ id: user._id });
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        // Genera uno nuevo de 15 minutos
        const newAccessToken = await createAccessToken({ id: user._id, correo: user.correo, rol: user.rol });

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 minutos
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        });

        return res.status(200).json({ ok: true });
    } catch (error) {
        // Si expiró (no si es inválido por otra razón), limpia el token muerto del array
        if (error instanceof jwt.TokenExpiredError) {
            const decodedExpired = jwt.decode(token) as CustomJwtPayload | null;
            if (decodedExpired?.id) {
                await UserModel.findByIdAndUpdate(decodedExpired.id, {
                    $pull: { refreshTokens: token },
                });
            }
        }
        return res.status(401).json({ ok: false, msg: "Sesión expirada, inicia sesión de nuevo" });
    }
};


export const logout = async (req: AuthRequest, res: Response) => {
    const token = req.cookies.refreshToken;

    if (token && req.id) {
        await UserModel.findByIdAndUpdate(req.id, {
            $pull: { refreshTokens: token },
        });
    }

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    return res.status(200).json({ ok: true, msg: "Sesión cerrada" });
};

export const logoutAll = async (req: AuthRequest, res: Response) => {
    await UserModel.findByIdAndUpdate(req.id, { refreshTokens: [] });
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.status(200).json({ ok: true, msg: "Todas las sesiones cerradas" });
};
