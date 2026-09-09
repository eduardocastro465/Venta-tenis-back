import type { Request, Response, NextFunction } from 'express';
import { sanitize } from 'express-mongo-sanitize';

export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = sanitize(req.body);
    }
    next();
};