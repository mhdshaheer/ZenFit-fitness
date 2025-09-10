import { ISession } from "../../models/session.model";

export interface ISessionService {
  saveSession(
    id: string,
    slotStatus: string,
    sessionData: ISession
  ): Promise<ISession | null>;
}
