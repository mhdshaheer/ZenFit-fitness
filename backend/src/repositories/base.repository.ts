import { Model, Document } from "mongoose";

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

  async createAndPopulate<P>(
    data: Partial<T>,
    populatePaths: string | string[]
  ): Promise<P> {
    const doc = await this.model.create(data);
    return (await (doc as Document).populate(populatePaths)) as P;
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

  async findByName(name: string): Promise<T | null> {
    return await this.model.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
  }
  async find(): Promise<T[]> {
    return await this.model.find();
  }
}
