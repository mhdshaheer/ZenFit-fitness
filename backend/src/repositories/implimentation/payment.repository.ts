import mongoose, { Types } from "mongoose";
import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
import { IPayment, PaymentModel } from "../../models/payment.model";
import { BaseRepository } from "../base.repository";
import { IPaymentRepository } from "../interface/payment.repostitory.interface";
import {
  IRevenueFilter,
  IRevenueData,
} from "../../interfaces/payment.interface";

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
  async getRevenueByFilter(filter: IRevenueFilter): Promise<IRevenueData[]> {
    const matchStage = { paymentStatus: "success" };

    let groupStage = {};
    let projectStage = {};
    let sortStage = {};

    switch (filter) {
      case "weekly":
        groupStage = {
          _id: { $dayOfWeek: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        };
        projectStage = {
          _id: 0,
          name: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Sun" },
                { case: { $eq: ["$_id", 2] }, then: "Mon" },
                { case: { $eq: ["$_id", 3] }, then: "Tue" },
                { case: { $eq: ["$_id", 4] }, then: "Wed" },
                { case: { $eq: ["$_id", 5] }, then: "Thu" },
                { case: { $eq: ["$_id", 6] }, then: "Fri" },
                { case: { $eq: ["$_id", 7] }, then: "Sat" },
              ],
              default: "Unknown",
            },
          },
          revenue: "$totalRevenue",
        };
        sortStage = { _id: 1 };
        break;

      case "monthly":
        groupStage = {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        };
        projectStage = {
          _id: 0,
          name: {
            $arrayElemAt: [
              [
                "",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              "$_id",
            ],
          },
          revenue: "$totalRevenue",
        };
        sortStage = { _id: 1 };
        break;

      case "yearly":
        groupStage = {
          _id: { $year: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        };
        projectStage = {
          _id: 0,
          name: "$_id",
          revenue: "$totalRevenue",
        };
        sortStage = { _id: 1 };
        break;
    }

    const revenueData = await this.model.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $project: projectStage },
      { $sort: sortStage },
    ]);

    return revenueData;
  }
  async getRevenueByFilterByTrainer(
    trainerId: string,
    filter: IRevenueFilter
  ): Promise<IRevenueData[]> {
    const matchStage = { trainerId, paymentStatus: "success" };

    let groupStage = {};
    let projectStage = {};
    let sortStage = {};

    switch (filter) {
      case "weekly":
        groupStage = {
          _id: { $dayOfWeek: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        };
        projectStage = {
          _id: 0,
          name: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Sun" },
                { case: { $eq: ["$_id", 2] }, then: "Mon" },
                { case: { $eq: ["$_id", 3] }, then: "Tue" },
                { case: { $eq: ["$_id", 4] }, then: "Wed" },
                { case: { $eq: ["$_id", 5] }, then: "Thu" },
                { case: { $eq: ["$_id", 6] }, then: "Fri" },
                { case: { $eq: ["$_id", 7] }, then: "Sat" },
              ],
              default: "Unknown",
            },
          },
          revenue: "$totalRevenue",
        };
        sortStage = { _id: 1 };
        break;

      case "monthly":
        groupStage = {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        };
        projectStage = {
          _id: 0,
          name: {
            $arrayElemAt: [
              [
                "",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              "$_id",
            ],
          },
          revenue: "$totalRevenue",
        };
        sortStage = { _id: 1 };
        break;

      case "yearly":
        groupStage = {
          _id: { $year: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        };
        projectStage = {
          _id: 0,
          name: "$_id",
          revenue: "$totalRevenue",
        };
        sortStage = { _id: 1 };
        break;
    }

    const revenueData = await this.model.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $project: projectStage },
      { $sort: sortStage },
    ]);

    return revenueData;
  }

  async getPurchasedProgramIds(
    userId: string
  ): Promise<{ _id: string; programId: string }[]> {
    const programIds = await this.model
      .find({
        userId: userId,
        paymentStatus: "success",
      })
      .select("programId")
      .lean();
    return programIds.map((p) => ({
      _id: p._id.toString(),
      programId: p.programId.toString(),
    }));
  }
}
