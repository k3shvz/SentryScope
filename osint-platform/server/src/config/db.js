import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to server/.env before running.');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected.');
}
