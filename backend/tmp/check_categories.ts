import mongoose from 'mongoose';
import { CategoryModel } from '../src/models/category.model';
import dotenv from 'dotenv';
dotenv.config();

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const categories = await CategoryModel.find({ parantId: null });
    console.log('Categories found:', JSON.stringify(categories, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkCategories();
