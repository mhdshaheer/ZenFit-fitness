import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.config";

export const googleClient = new OAuth2Client(env.google_client_id);

export const verifyGoogleToken = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.google_client_id,
  });

  return ticket.getPayload();
};
