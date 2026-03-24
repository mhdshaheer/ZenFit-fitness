import { inject, injectable } from "inversify";
import { IAuthStrategy } from "../../interface/auth.strategy.interface";
import { IUserRepository } from "../../../repositories/interface/user.repository.interface";
import { TYPES } from "../../../shared/types/inversify.types";
import { IUser, IGoogleProfile } from "../../../interfaces/user.interface";

@injectable()
export class GoogleAuthStrategy implements IAuthStrategy {
    readonly name = "google";

    constructor(
        @inject(TYPES.UserRepository) private _userRepository: IUserRepository
    ) { }

    async authenticate(credentials: unknown): Promise<IUser> {
        const profile = credentials as IGoogleProfile;
        let user = await this._userRepository.findByGoogleId(profile.id);

        if (!user) {
            const existingUser = await this._userRepository.findByEmail(profile.emails[0].value);
            if (existingUser) {
                // If a user exists with this email but no googleId, it's a traditional account
                throw new Error("This email is already registered with a password. Please log in using your credentials.");
            }

            user = await this._userRepository.createGoogleUser({
                googleId: profile.id,
                email: profile.emails[0].value,
                username: profile.displayName,
                fullName: profile.displayName,
                role: "user",
            });
        }

        return user;
    }
}
