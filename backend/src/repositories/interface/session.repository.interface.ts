import { ISession } from "../../models/session.model";

export interface ISessionRepository {
  createSession(
    condition: Partial<ISession>,
    sessions: Partial<ISession>
  ): Promise<ISession | null>;
}
