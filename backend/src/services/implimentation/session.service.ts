import { ISession } from "../../models/session.model";
import { SessionRepository } from "../../repositories/implimentation/session.repository";
import { ISessionService } from "../interface/session.service.interface";

export class SessionService implements ISessionService {
  sessionRepository = new SessionRepository();
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
