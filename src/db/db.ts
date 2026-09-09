import mongoose from 'mongoose';
import { MONGO_URI } from '../config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};