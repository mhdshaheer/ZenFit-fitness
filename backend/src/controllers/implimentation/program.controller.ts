import { Request, Response } from "express";
import { IProgramController } from "../interface/program.controller.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { IProgramService } from "../../services/interface/program.service.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { ProgramDto } from "../../dtos/program.dtos";
import { HttpResponse } from "../../const/response_message.const";

export class ProgramController implements IProgramController {
  constructor(
    @inject(TYPES.ProgramService) private programService: IProgramService
  ) {}

  async saveProgramDraft(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const userId = (req as any).user.id;
      data.trainerId = userId;
      console.log("program draft data :", data);

      if (!data) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Program data is required" });
        return;
      }

      const draft = await this.programService.saveProgramDraft(data);
      console.log("stored data from the db :", draft);

      if (!draft) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Failed to save draft" });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: "Program draft is saved successfully",
      });
      return;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving program draft:", error);

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: "An error occurred while saving the program draft",
          error: error.message || "Unexpected error",
        });
      }
    }
  }

  async saveProgram(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const userId = (req as any).user.id;
      data.trainerId = userId;
      console.log("program draft data :", data);

      if (!data) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Program data is required" });
        return;
      }

      const program = await this.programService.saveProgramDraft(data);
      console.log("stored data from the db :", program);

      if (!program) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Failed to save Training Program" });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: "Training Program is saved successfully",
      });
      return;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving Training program:", error);

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: "An error occurred while saving the Training program",
          error: error.message || "Unexpected error",
        });
      }
    }
  }

  async getPrograms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any)?.user?.id;
      const programs = await this.programService.getPrograms(userId);
      res.status(HttpStatus.OK).json({ programs });
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Failed to fetch programs",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getProgramsCategories(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any)?.user?.id;
      const programs = await this.programService.getProgramsCategories(userId);
      res.status(HttpStatus.OK).json({ programs });
    } catch (error) {
      console.error("Error fetching program category:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Failed to fetch program category",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getProgramsByParantId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const programs = await this.programService.getProgramsByParentId(id);
      res.status(HttpStatus.OK).json({ programs });
    } catch (error) {
      console.error("Error fetching program category:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Failed to fetch program category",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async findProgram(
    req: Request,
    res: Response
  ): Promise<Response<ProgramDto>> {
    try {
      const { id } = req.params;
      const program = await this.programService.findProgram(id);
      return res.status(HttpStatus.OK).json(program);
    } catch (error) {
      console.error("Error in fetching category:", error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(HttpResponse.SERVER_ERROR);
    }
  }

  async updateProgram(
    req: Request,
    res: Response
  ): Promise<Response<{ message: string }>> {
    try {
      const programId = req.params.id;
      const programData = req.body;
      let response = await this.programService.updateProgram(
        programId,
        programData
      );
      if (!response) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: "Program updation failed" });
      }
      return res
        .status(HttpStatus.OK)
        .json({ message: "Program updated successfully" });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to update program" });
    }
  }
}
