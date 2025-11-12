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
  IPurchasedProgramFilters,
  IPurchasedProgramsResponse,
  IPurchasedProgramItem,
  ITrainerPurchasedProgramFilters,
  ITrainerPurchasedProgramsResponse,
  ITrainerPurchasedProgram,
} from "../../interfaces/payment.interface";
import { injectable } from "inversify";

@injectable()
export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository {
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

  // Recommended database indexes for optimal pagination performance:
  // 1. { userId: 1, paymentStatus: 1, createdAt: -1 } - for main query and sorting
  // 2. { programId: 1 } - for program lookup
  // 3. { trainerId: 1 } - for trainer lookup
  async findPurchasedProgramWithPagination(
    userId: string,
    limit: number,
    offset: number,
    search?: string,
    status?: string
  ): Promise<PurchasedProgram[]> {
    const matchStage: any = {
      userId: new mongoose.Types.ObjectId(userId),
      paymentStatus: "success",
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      matchStage.paymentStatus = status;
    }

    const pipeline: any[] = [
      { $match: matchStage },
      // Sort early to optimize pagination
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "programDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
                category: 1,
                difficultyLevel: 1,
                description: 1,
                trainerId: 1
              }
            }
          ]
        },
      },
      { $unwind: "$programDetails" },
      {
        $lookup: {
          from: "users",
          localField: "programDetails.trainerId",
          foreignField: "_id",
          as: "trainerDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                username: 1,
                email: 1
              }
            }
          ]
        },
      },
      { $unwind: "$trainerDetails" },
      {
        $project: {
          _id: 0,
          programId: "$programDetails._id",
          title: "$programDetails.title",
          category: "$programDetails.category",
          difficultyLevel: "$programDetails.difficultyLevel",
          description: "$programDetails.description",
          trainerId: "$programDetails.trainerId",
          trainerName: {
            $cond: {
              if: { $and: [{ $ne: ["$trainerDetails.fullName", null] }, { $ne: ["$trainerDetails.fullName", ""] }] },
              then: "$trainerDetails.fullName",
              else: "$trainerDetails.username"
            }
          },
          trainerEmail: "$trainerDetails.email",
          amountPaid: "$amount",
          paymentMethod: 1,
          purchasedAt: "$createdAt",
        },
      },
    ];

    // Add search filter if provided
    if (search && search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search.trim(), $options: "i" } },
            { trainerName: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } }
          ]
        }
      });
    }

    // Apply pagination at the end
    pipeline.push(
      { $skip: offset },
      { $limit: limit }
    );

    return await this.model.aggregate(pipeline);
  }

  async countPurchasedPrograms(userId: string, search?: string, status?: string): Promise<number> {
    const matchStage: any = {
      userId: new mongoose.Types.ObjectId(userId),
      paymentStatus: "success",
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      matchStage.paymentStatus = status;
    }

    // If no search, use simple count for better performance
    if (!search || !search.trim()) {
      return await this.model.countDocuments(matchStage);
    }

    // If search is provided, use optimized aggregation to count filtered results
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "programDetails",
          pipeline: [
            {
              $project: {
                title: 1,
                description: 1,
                trainerId: 1
              }
            }
          ]
        },
      },
      { $unwind: "$programDetails" },
      {
        $lookup: {
          from: "users",
          localField: "programDetails.trainerId",
          foreignField: "_id",
          as: "trainerDetails",
          pipeline: [
            {
              $project: {
                fullName: 1,
                username: 1
              }
            }
          ]
        },
      },
      { $unwind: "$trainerDetails" },
      {
        $project: {
          title: "$programDetails.title",
          trainerName: {
            $cond: {
              if: { $and: [{ $ne: ["$trainerDetails.fullName", null] }, { $ne: ["$trainerDetails.fullName", ""] }] },
              then: "$trainerDetails.fullName",
              else: "$trainerDetails.username"
            }
          },
          description: "$programDetails.description",
        },
      },
      {
        $match: {
          $or: [
            { title: { $regex: search.trim(), $options: "i" } },
            { trainerName: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } }
          ]
        }
      },
      { $count: "total" }
    ];

    const result = await this.model.aggregate(pipeline);
    return result.length > 0 ? result[0].total : 0;
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

  async getPurchasedPrograms(
    filters: IPurchasedProgramFilters
  ): Promise<IPurchasedProgramsResponse> {
    const {
      paymentStatus,
      startDate,
      endDate,
      search,
      trainerId,
      categoryId,
      page = 1,
      limit = 20,
    } = filters;

    const matchStage: any = {};

    if (paymentStatus) {
      matchStage.paymentStatus = paymentStatus;
    }

    if (trainerId) {
      matchStage.trainerId = new Types.ObjectId(trainerId);
    }

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const pipeline: any[] = [
      { $match: matchStage },

      // Populate User
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Populate Trainer
      {
        $lookup: {
          from: "users",
          localField: "trainerId",
          foreignField: "_id",
          as: "trainer",
        },
      },
      { $unwind: "$trainer" },

      // Populate Program
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: "$program" },

      // Populate Category
      {
        $lookup: {
          from: "categories",
          localField: "program.category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (categoryId) {
      pipeline.push({
        $match: {
          "category._id": new Types.ObjectId(categoryId),
        },
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.fullName": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "trainer.fullName": { $regex: search, $options: "i" } },
            { programName: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({
      $project: {
        _id: 1,
        purchaseDate: "$createdAt",
        updatedAt: 1,
        user: {
          _id: "$user._id",
          fullName: "$user.fullName",
          email: "$user.email",
          phone: "$user.phone",
          profileImage: "$user.profileImage",
          status: "$user.status",
        },
        trainer: {
          _id: "$trainer._id",
          fullName: "$trainer.fullName",
          email: "$trainer.email",
          phone: "$trainer.phone",
          profileImage: "$trainer.profileImage",
          experience: "$trainer.experience",
        },
        program: {
          _id: "$program._id",
          programId: "$program.programId",
          title: "$program.title",
          description: "$program.description",
          category: {
            _id: "$category._id",
            name: "$category.name",
          },
          difficultyLevel: "$program.difficultyLevel",
          price: "$program.price",
          duration: "$program.duration",
          status: "$program.status",
        },
        payment: {
          amount: "$amount",
          platformFee: "$platformFee",
          trainerEarning: "$trainerEarning",
          currency: "$currency",
          paymentStatus: "$paymentStatus",
          paymentMethod: "$paymentMethod",
          paymentIntentId: "$paymentIntentId",
          chargeId: "$chargeId",
          receiptUrl: "$receiptUrl",
        },
      },
    });

    pipeline.push({ $sort: { purchaseDate: -1 } });

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await PaymentModel.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    const data = await PaymentModel.aggregate<IPurchasedProgramItem>(pipeline);

    return {
      data,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getTrainerPurchasedPrograms(
    filters: ITrainerPurchasedProgramFilters
  ): Promise<ITrainerPurchasedProgramsResponse> {
    const {
      trainerId,
      paymentStatus,
      startDate,
      endDate,
      search,
      programId,
      page = 1,
      limit = 10,
    } = filters;

    const matchStage: any = {
      trainerId: new Types.ObjectId(trainerId),
    };

    if (paymentStatus) {
      matchStage.paymentStatus = paymentStatus;
    }

    if (programId) {
      matchStage.programId = new Types.ObjectId(programId);
    }

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const pipeline: any[] = [
      { $match: matchStage },

      // Populate User
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Populate Program
      {
        $lookup: {
          from: "programs",
          localField: "programId",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: "$program" },

      // Populate Category
      {
        $lookup: {
          from: "categories",
          localField: "program.category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.fullName": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "program.title": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Project fields
    pipeline.push({
      $project: {
        _id: 1,
        purchaseDate: "$createdAt",
        updatedAt: 1,
        user: {
          _id: "$user._id",
          fullName: "$user.fullName",
          email: "$user.email",
          phone: "$user.phone",
          profileImage: "$user.profileImage",
          status: "$user.status",
        },
        program: {
          _id: "$program._id",
          programId: "$program.programId",
          title: "$program.title",
          description: "$program.description",
          category: {
            _id: "$category._id",
            name: "$category.name",
          },
          difficultyLevel: "$program.difficultyLevel",
          price: "$program.price",
          duration: "$program.duration",
          status: "$program.status",
        },
        payment: {
          amount: "$amount",
          platformFee: "$platformFee",
          trainerEarning: "$trainerEarning",
          currency: "$currency",
          paymentStatus: "$paymentStatus",
          paymentMethod: "$paymentMethod",
          paymentIntentId: "$paymentIntentId",
          chargeId: "$chargeId",
          receiptUrl: "$receiptUrl",
        },
      },
    });

    pipeline.push({ $sort: { purchaseDate: -1 } });

    // Count total
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await PaymentModel.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    const data = await PaymentModel.aggregate<ITrainerPurchasedProgram>(
      pipeline
    );

    return {
      data,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
