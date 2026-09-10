import jwt from 'jsonwebtoken'
import type { Types } from 'mongoose';
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../config.js";

export async function createAccessToken(payload: { id: Types.ObjectId | string, correo: string, rol: string }): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" }, (err, token) => {
            if (err) {
                return reject(err);
            }
            resolve(token as string);
        });
    });
}

export const createRefreshToken = (payload: {id: Types.ObjectId | string} ): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" }, (err, token) => {
            if (err) return reject(err);
            resolve(token as string);
        });
    });
};

