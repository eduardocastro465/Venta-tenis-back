import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { allowedOrigins } from './config.js';
// import { generalLimiter } from './middleware/rateLimit.js';
import { langMiddleware, type LangRequest } from './middleware/lang.middleware.js';
import { sanitizeBody } from './middleware/sanitize.middleware.js';

// Rutas
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import lotRoutes from "./routes/lot.routes.js";
import filterRoutes from "./routes/filters.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import ofertasRoutes from './routes/ofertas.routes.js';

const app = express();

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' })); // evita que alguien mande un JSON gigante y tumbe el servidor
app.use(sanitizeBody); // limpia inyecciones de NoSQL
// app.use(generalLimiter); // limita el número de peticiones
app.use(langMiddleware as express.RequestHandler); // detecta en que idioma responder


app.get('/', (req: Request, res: Response) => {
    const { msg } = req as LangRequest;
    res.send(msg?.general.apiRunning);
});

// Rutas
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ofertas', ofertasRoutes);
app.use('/api/lot', lotRoutes);


app.use((req: Request, res: Response) => {
    const { msg } = req as LangRequest;
    res.status(404).json({ error: msg?.general.routeNotFound });
});

export default app;