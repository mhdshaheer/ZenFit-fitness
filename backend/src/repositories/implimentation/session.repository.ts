import { ISession, SessionModel } from "../../models/session.model";
import { BaseRepository } from "../base.repository";
import { ISessionRepository } from "../interface/session.repository.interface";
import { injectable } from "inversify";

@injectable()
export class SessionRepository
  extends BaseRepository<ISession>
  implements ISessionRepository {
  constructor() {
    super(SessionModel);
  }
  async createSession(
    condition: Partial<ISession>,
    sessions: Partial<ISession>
  ): Promise<ISession | null> {
    return await this.updateCondition(condition, sessions);
  }
  async getSessionsById(id: string): Promise<ISession | null> {
    return await this.model.findOne({ programId: id }).exec();
  }
}
