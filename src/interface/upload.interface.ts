export interface ImagenError {
    archivo: string;
    motivo: string;
}

export interface UploadMultipleResult {
    imagenes: string[];
    errores: ImagenError[];
}

export interface VarianteConImagenes {
    imagenes?: string[];
    [key: string]: any;
}
