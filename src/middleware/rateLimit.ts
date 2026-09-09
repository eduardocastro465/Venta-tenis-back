import rateLimit from 'express-rate-limit';

// Límite general para toda la API
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máx 100 requests por IP en esa ventana
    message: { error: 'Demasiadas solicitudes, intenta más tarde' },
    standardHeaders: true, // manda info del límite en headers (RateLimit-*)
    legacyHeaders: false,
});

// Límite más estricto para login/register (previene fuerza bruta)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // solo 10 intentos de login/register cada 15 min por IP
    message: { error: 'Demasiados intentos, intenta más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
});