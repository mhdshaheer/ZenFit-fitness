import { inject, injectable } from "inversify";
import { ISession } from "../../models/session.model";
import { ISessionService } from "../interface/session.service.interface";
import { TYPES } from "../../types/inversify.types";
import { ISessionRepository } from "../../repositories/interface/session.repository.interface";

@injectable()
export class SessionService implements ISessionService {
  constructor(
    @inject(TYPES.SessionRepository)
    private sessionRepository: ISessionRepository
  ) {}
  async saveSession(
    id: string,
    slotStatus: "active" | "inactive" | "draft",
    sessionData: ISession
  ): Promise<ISession | null> {
    const condition = {
      trainerId: id,
      programId: sessionData.programId,
    };
    const result = await this.sessionRepository.createSession(condition, {
      ...sessionData,
      slotStatus: slotStatus,
    });

    return result;
  }
}
