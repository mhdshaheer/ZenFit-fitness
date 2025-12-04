import { Request, Response } from "express";
import { IProgramController } from "../interface/program.controller.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { IProgramService } from "../../services/interface/program.service.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { ProgramDto, ProgramSlotCreateDto } from "../../dtos/program.dtos";
import { AppError } from "../../shared/utils/appError.util";
import { HttpResponse } from "../../const/response_message.const";
import { INotificationService } from "../../services/interface/notification.service.interface";
import { IProfileService } from "../../services/interface/profile.service.interface";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

@injectable()
export class ProgramController implements IProgramController {
  @inject(TYPES.NotificationService)
  private readonly _notificationService!: INotificationService;

  @inject(TYPES.ProfileService)
  private readonly _profileService!: IProfileService;
  constructor(
    @inject(TYPES.ProgramService)
    private readonly _programService: IProgramService
  ) { }

  async saveProgramDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = req.body;
    const userId = req.user?.id;

    if (!data) {
      throw new AppError(
        HttpResponse.PROGRAM_DATA_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    data.trainerId = userId;
    const draft = await this._programService.saveProgramDraft(data);

    if (!draft) {
      throw new AppError(
        HttpResponse.PROGRAM_SAVED_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    res.status(HttpStatus.OK).json({
      message: HttpResponse.PROGRAM_SAVED_SUCCESSFULLY,
    });
  }

  async saveProgram(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const userId = (req as any)?.user?.id;

    if (!data) {
      throw new AppError(
        HttpResponse.PROGRAM_DATA_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    data.trainerId = userId;
    const trainerProfile = await this._profileService.getProfile(userId);
    const trainerDisplayName =
      trainerProfile.fullName || trainerProfile.username || "Trainer";
    const program = await this._programService.saveProgram(data);

    if (!program) {
      throw new AppError(
        HttpResponse.PROGRAM_SAVED_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    await this._notificationService.createNotification(
      data.trainerId,
      "trainer",
      "Program Created Successfully",
      `Your new program, "${program.title}", has been created.`
    );
    const admins = await this._profileService.getUsersByRole("admin");
    admins.forEach(async (item) => {
      await this._notificationService.createNotification(
        item.id,
        "admin",
        "New Program Added",
        `${trainerDisplayName} has just added a new program: "${program.title}".`
      );
    });

    res.status(HttpStatus.OK).json({
      message: HttpResponse.PROGRAM_SAVED_SUCCESSFULLY,
    });
  }

  async getPrograms(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.user?.id;
    const programs = await this._programService.getPrograms(userId);

    res.status(HttpStatus.OK).json({ programs });
  }

  async getProgramsCategories(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.user?.id;
    const programs = await this._programService.getProgramsCategories(userId);

    res.status(HttpStatus.OK).json({ programs });
  }
  async getAllPrograms(
    _req: Request,
    res: Response
  ): Promise<Response<ProgramDto[]>> {
    const programs = await this._programService.getAllPrograms();
    return res.status(HttpStatus.OK).json(programs);
  }

  async getProgramsForSlotCreate(
    req: Request,
    res: Response
  ): Promise<Response<ProgramSlotCreateDto[]>> {
    const trainerId = (req as any).user.id;
    const programs = await this._programService.getProgramsForSlotCreate(
      trainerId
    );
    return res.status(HttpStatus.OK).json(programs);
  }

  async getProgramsByParantId(req: Request, res: Response): Promise<void> {
    const parantCategoryId = req.params.id;
    const userId = (req as any).user.id;
    const programs = await this._programService.getProgramsByParentId(
      parantCategoryId,
      userId
    );

    res.status(HttpStatus.OK).json({ programs });
  }

  async findProgram(
    req: Request,
    res: Response
  ): Promise<Response<ProgramDto>> {
    const { id } = req.params;
    const program = await this._programService.findProgram(id);

    if (!program) {
      throw new AppError(HttpResponse.PROGRAM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return res.status(HttpStatus.OK).json(program);
  }

  async updateProgram(
    req: Request,
    res: Response
  ): Promise<Response<{ message: string }>> {
    const programId = req.params.id;
    const trainerId = (req as any)?.user?.id;
    const programData = req.body;

    const response = await this._programService.updateProgram(programId, {
      ...programData,
      trainerId,
    });

    if (!response) {
      throw new AppError(
        HttpResponse.PROGRAM_UPDATE_FAILED,
        HttpStatus.NOT_FOUND
      );
    }

    const [admins, trainerProfile] = await Promise.all([
      this._profileService.getUsersByRole("admin"),
      this._profileService.getProfile(trainerId),
    ]);
    const trainerDisplayName =
      trainerProfile.fullName || trainerProfile.username || "Trainer";
    await Promise.all(
      admins.map((admin) =>
        this._notificationService.createNotification(
          admin.id,
          "admin",
          "Program Resubmitted",
          `${trainerDisplayName} has resubmitted "${response.title}" for review.`
        )
      )
    );

    return res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.PROGRAM_UPDATE_SUCCESS });
  }

  async updateApprovalStatus(
    req: Request,
    res: Response
  ): Promise<Response<ProgramDto>> {
    const { programId } = req.params;
    const approvalStatus = req.body.approvalStatus;
    const program = await this._programService.updateApprovalStatus(
      programId,
      approvalStatus
    );
    const users = await this._profileService.getUsersByRole("user");
    users.forEach(async (item) => {
      await this._notificationService.createNotification(
        item.id,
        "user",
        `Discover a New Program: ${program.title}!`,
        `Exciting news! New Program is lauched: "${program.title}". Check it out now!`
      );
    });
    const trainerId =
      typeof program.trainerId === "object"
        ? (program.trainerId as any)?.toString()
        : program.trainerId!;
    const notificationTitle =
      approvalStatus === "Approved" ? "Program Approved" : "Program Rejected";
    const notificationMessage =
      approvalStatus === "Approved"
        ? `${program.title} has been approved and is now live.`
        : `${program.title} was rejected. Please review the feedback and update the program.`;

    await this._notificationService.createNotification(
      trainerId,
      "trainer",
      notificationTitle,
      notificationMessage
    );
    return res.status(HttpStatus.OK).json(program);
  }
}
