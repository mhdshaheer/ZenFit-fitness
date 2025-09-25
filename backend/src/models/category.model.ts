import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  parantId: Types.ObjectId | null;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    description: { type: String },
    isBlocked: { type: Boolean, default: false },
    parantId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model<ICategory>(
  "Category",
  CategorySchema
);
