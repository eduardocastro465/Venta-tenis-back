

//Configuración del servidor
export const PORT = process.env.PORT || 4000;
export const API_VERSION = process.env.API_VERSION || "v1";

// sitios web permitidos
const CORS_ORIGINS = process.env.CORS_ORIGINS || "http://localhost:5173";
export const allowedOrigins = CORS_ORIGINS.split(",").map((origin) => origin.trim());


//Conexion a la base de datos
export const MONGO_URI = process.env.MONGO_URI as string;

//Cloudinary
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER as string;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Token secrets
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// Token de Groq
export const GROQ_API_KEY_1 = process.env.GROQ_API_KEY_1 as string;
export const GROQ_API_KEY_2 = process.env.GROQ_API_KEY_2 as string;
export const GROQ_API_KEY_3 = process.env.GROQ_API_KEY_3 as string;

