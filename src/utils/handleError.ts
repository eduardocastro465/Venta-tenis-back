import type { Response } from 'express';
import mongoose from 'mongoose';
import type { Messages } from '../config/messages.js';

export const handleError = (
    error: unknown,
    res: Response,
    msg?: Messages,
    context = 'Error'
) => {
    console.error(`${context}:`, error);

    if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ error: error.message });
    }

    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ error: msg?.general.invalidId ?? 'Invalid ID' });
    }

    res.status(500).json({ error: msg?.general.serverError ?? 'Internal server error' });
};