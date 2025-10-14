import mongoose, { Types } from "mongoose";
import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
import { IPayment, PaymentModel } from "../../models/payment.model";
import { BaseRepository } from "../base.repository";
import { IPaymentRepository } from "../interface/payment.repostitory.interface";

export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }
  async createPayment(data: Partial<IPayment>): Promise<IPayment> {
    return await this.create(data);
  }
  async updatePaymentStatus(
    id: string,
    updateData: Partial<IPayment>
  ): Promise<IPayment | null> {
    return await this.update(id, updateData);
  }

  async getProgramsByTrainerId(trainerId: string): Promise<IPayment[]> {
    return this.model.find({ trainerId });
  }
  async getPayments(): Promise<IPayment[]> {
    return this.model.find();
  }
  async findPurchasedProgram(userId: string): Promise<PurchasedProgram[]> {
    return await this.model.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          paymentStatus: "success",
        },
      },
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "programDetails",
        },
      },
      { $unwind: "$programDetails" },
      {
        $project: {
          _id: 0,
          programId: "$programDetails._id",
          title: "$programDetails.title",
          category: "$programDetails.category",
          duration: "$programDetails.duration",
          difficultyLevel: "$programDetails.difficultyLevel",
          description: "$programDetails.description",
          trainerId: "$programDetails.trainerId",
          amountPaid: "$amount",
          paymentMethod: 1,
          purchasedAt: "$createdAt",
        },
      },
    ]);
  }
  async getEntrolledUsers(programId: string): Promise<number> {
    let count = await this.model.countDocuments({
      programId: new mongoose.Types.ObjectId(programId),
      paymentStatus: "success",
    });
    return count;
  }

  async getTopSellingCategory(limit: number): Promise<ITopSellingCategory[]> {
    return this.model.aggregate([
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: "$program" },
      {
        $lookup: {
          from: "categories",
          localField: "program.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalPurchases: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: limit },
    ]);
  }

  async getTopSellingPrograms(limit: number): Promise<ITopSellingPrograms[]> {
    return this.model.aggregate([
      { $match: { paymentStatus: "success" } },
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: "$program" },
      {
        $group: {
          _id: "$program._id",
          courseName: { $first: "$program.title" },
          totalPurchases: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: limit },
    ]);
  }
  async getTopSellingCategoryByTrainer(
    trainerId: string,
    limit: number
  ): Promise<ITopSellingCategory[]> {
    return this.model.aggregate([
      { $match: { trainerId: new Types.ObjectId(trainerId) } },
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: "$program" },
      {
        $lookup: {
          from: "categories",
          localField: "program.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalPurchases: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: limit },
    ]);
  }
  async getTopSellingProgramsByTrainer(
    trainerId: string,
    limit: number
  ): Promise<ITopSellingPrograms[]> {
    return this.model.aggregate([
      {
        $match: {
          trainerId: new Types.ObjectId(trainerId),
          paymentStatus: "success",
        },
      },
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: "$program" },
      {
        $group: {
          _id: "$program._id",
          courseName: { $first: "$program.title" },
          totalPurchases: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: limit },
    ]);
  }
}
