const messages = {
    es: {
        auth: {
            missingToken: 'No autorizado, falta token',
            emptyToken: 'No autorizado, token vacio',
            invalidToken: 'Token invalido o expirado',
        },
        general: {
            routeNotFound: 'Ruta no encontrada',
            apiRunning: 'API funcionando',
            invalidId: 'ID no valido',
            serverError: 'Error interno del servidor',
        },
    },
    en: {
        auth: {
            missingToken: 'Unauthorized, missing token',
            emptyToken: 'Unauthorized, empty token',
            invalidToken: 'Invalid or expired token',
        },
        general: {
            routeNotFound: 'Route not found',
            apiRunning: 'API running',
            invalidId: 'Invalid ID',
            serverError: 'Internal server error',
        },
    },
} as const;

type Lang = keyof typeof messages;
export type Messages = (typeof messages)[Lang];

const DEFAULT_LANG: Lang = 'es';

/**
 * Detecta el idioma del header Accept-Language y devuelve los mensajes correspondientes.
 */
export const getMessages = (acceptLanguage?: string): Messages => {
    if (!acceptLanguage) return messages[DEFAULT_LANG];

    const lang = acceptLanguage.split(',')[0]?.split(';')[0]?.trim().split('-')[0]?.toLowerCase();

    if (lang && lang in messages) {
        return messages[lang as Lang];
    }

    return messages[DEFAULT_LANG];
};
