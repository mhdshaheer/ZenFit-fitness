import { inject, injectable } from "inversify";
import { IAuthStrategy } from "../../interface/auth.strategy.interface";
import { IUserRepository } from "../../../repositories/interface/user.repository.interface";
import { TYPES } from "../../../shared/types/inversify.types";
import { comparePassword } from "../../../shared/utils/hash.util";
import { IUser } from "../../../interfaces/user.interface";
import { AppError } from "../../../shared/utils/appError.util";
import { HttpStatus } from "../../../const/statuscode.const";
import { HttpResponse } from "../../../const/response_message.const";

@injectable()
export class EmailAuthStrategy implements IAuthStrategy {
    readonly name = "email";

    constructor(
        @inject(TYPES.UserRepository) private _userRepository: IUserRepository
    ) { }

    async authenticate(credentials: unknown): Promise<IUser> {
        if (!credentials || typeof credentials !== 'object') {
            throw new AppError("Invalid credentials format", HttpStatus.BAD_REQUEST);
        }
        const { email, password } = credentials as Record<string, string>;
        const user = await this._userRepository.findByEmail(email);

        if (!user || !user.password) {
            throw new AppError(HttpResponse.INVALID_EMAIL_PASSWORD, HttpStatus.UNAUTHORIZED);
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AppError(HttpResponse.INVALID_EMAIL_PASSWORD, HttpStatus.UNAUTHORIZED);
        }

        return user;
    }
}
