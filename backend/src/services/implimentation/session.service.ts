import { inject, injectable } from "inversify";
import { ISession } from "../../models/session.model";
import { ISessionService } from "../interface/session.service.interface";
import { ISessionRepository } from "../../repositories/interface/session.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";

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
  async getSession(id: string): Promise<ISession> {
    try {
      const session = await this.sessionRepository.getSessionsById(id);
      if (!session) {
        throw new Error("Session is not available");
      }
      return session;
    } catch (error) {
      throw new Error("Failed get sessions");
    }
  }
}
