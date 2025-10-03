import { ISession } from "../../models/session.model";

export interface ISessionService {
  saveSession(
    id: string,
    slotStatus: string,
    sessionData: ISession
  ): Promise<ISession | null>;

  getSession(id: string): Promise<ISession>;
}
