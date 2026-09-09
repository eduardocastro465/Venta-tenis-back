import type { Request, Response, NextFunction } from 'express';
import { getMessages, type Messages } from '../config/messages.js';

export interface LangRequest extends Request {
    msg?: Messages;
}

export const langMiddleware = (req: LangRequest, _res: Response, next: NextFunction): void => {
    req.msg = getMessages(req.headers['accept-language']);
    next();
};
