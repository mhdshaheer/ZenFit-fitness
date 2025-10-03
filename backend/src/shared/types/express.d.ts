import { IJwtPayload } from "../shared/types/jwtPayload.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload; 
    }
  }
}