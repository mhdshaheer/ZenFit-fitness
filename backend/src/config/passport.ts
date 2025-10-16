import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/user.model";
import { env } from "./env.config";
import { AuthService } from "../services/implimentation/auth.service";
import logger from "../shared/services/logger.service";

const authService = new AuthService();

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
      done: (error: any, user?: any) => void
    ) => {
      try {
        const user = await authService.handleGoogleLogin(profile);
        logger.info("on success passport file...");
        done(null, user);
      } catch (err) {
        logger.info("on failure passport file...");
        return done(err, null);
      }
    }
  )
);

// serialize/deserialize
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findById(id); // use rep here
  done(null, user);
});
