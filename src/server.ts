import 'dotenv/config';
import app from './app.js';
import { connectDB } from './db/db.js';
import { PORT } from './config.js';

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });