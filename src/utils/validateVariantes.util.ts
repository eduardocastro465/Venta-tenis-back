// src/utils/validateVariantes.util.ts

interface VarianteConColor {
    colorPrincipal?: string;
    [key: string]: any;
}

interface DuplicadosResult {
    hayDuplicados: boolean;
    coloresDuplicados: string[];
}

// Revisa si hay colores repetidos entre variantes (normalizando mayúsculas y espacios)
export const checkVariantesDuplicadas = (variantesParsed: VarianteConColor[]): DuplicadosResult => {
    const claves = variantesParsed.map(v => (v.colorPrincipal || '').trim().toLowerCase());
    const duplicados = claves.filter((c, i) => claves.indexOf(c) !== i);

    return {
        hayDuplicados: new Set(claves).size !== claves.length,
        coloresDuplicados: [...new Set(duplicados)],
    };
};