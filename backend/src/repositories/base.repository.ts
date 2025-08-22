import { Model } from "mongoose";

export abstract class BaseRepository<T> {
  constructor(protected model: Model<T>) {}
  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }
  async findOne(filter: Partial<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }
  async update(userId: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );
  }
}
