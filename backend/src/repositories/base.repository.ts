import {
  Document,
  Model,
  Types,
  FilterQuery,
  UpdateQuery,
  DeleteResult,
} from "mongoose";

export abstract class BaseRepository<T> {
  constructor(protected model: Model<T>) {}
  async findById(id: Types.ObjectId): Promise<T | null> {
    return this.model.findById(id);
  }
  async findIdAndUpdate(
    id: Types.ObjectId,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, {
      upsert: true,
      new: true,
    });
  }

  async findAll(): Promise<T[]> {
    return this.model.find();
  }
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document;
  }
  async update(id: Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
}
