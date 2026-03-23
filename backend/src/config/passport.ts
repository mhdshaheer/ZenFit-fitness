import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/user.model";
import { env } from "./env.config";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { IAuthService } from "../services/interface/auth.service.interface";
import { IUser, IGoogleProfile } from "../interfaces/user.interface";

const authService = container.get<IAuthService>(TYPES.AuthService);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.google_client_id as string,
      clientSecret: env.google_client_secret as string,
      callbackURL: env.google_callback_url,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (error: Error | null | unknown, user?: Express.User) => void
    ) => {
      try {
        const user = await authService.handleGoogleLogin(profile as unknown as IGoogleProfile);
        done(null, user as unknown as Express.User);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// serialize/deserialize
passport.serializeUser((user: Express.User, done) => done(null, (user as unknown as IUser)._id));
passport.deserializeUser(async (id: unknown, done) => {
  try {
    const user = await UserModel.findById(id); // use rep here
    done(null, user as unknown as Express.User);
  } catch (err) {
    done(err, null);
  }
});
