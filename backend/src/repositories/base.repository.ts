import { Model } from "mongoose";

export abstract class BaseRepository<T> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async updateCondition(
    condition: Partial<T>,
    data: Partial<T>
  ): Promise<T | null> {
    return await this.model.findOneAndUpdate(
      condition,
      { $set: data },
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    );
  }
}
