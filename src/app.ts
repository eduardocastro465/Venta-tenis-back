import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { allowedOrigins } from './config.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { langMiddleware, type LangRequest } from './middleware/lang.middleware.js';
import { sanitizeBody } from './middleware/sanitize.middleware.js';
import authRoutes from "./routes/auth.routes.js";

// Rutas
import productRoutes from "./routes/products.routes.js";
import categoryRoutes from "./routes/category.routes.js";

const app = express();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(sanitizeBody); // limpia inyecciones de NoSQL
app.use(generalLimiter); // limita el número de peticiones
app.use(express.json({ limit: '10kb' })); // evita que alguien mande un JSON gigante y tumbe el servidor
app.use(langMiddleware as express.RequestHandler); // detecta en que idioma responder


app.get('/', (req: Request, res: Response) => {
    const { msg } = req as LangRequest;
    res.send(msg?.general.apiRunning);
});


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);



app.use((req: Request, res: Response) => {
    const { msg } = req as LangRequest;
    res.status(404).json({ error: msg?.general.routeNotFound });
});

export default app;