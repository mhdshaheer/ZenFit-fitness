import { IUser } from "../interfaces/user.interface";
import { UserDto, UserStatusDto } from "../dtos/user.dtos";

export const mapToUserDto = (user: IUser): UserDto => {
  return {
    id: user._id?.toString() || "",
    username: user.username!,
    email: user.email,
    dob: user.dob,
    gender: user.gender,
    role: user.role ?? "user",
    status: user.status!,
  };
};

export function mapToUserStatusDto(
  user: IUser,
  status: "active" | "blocked"
): UserStatusDto {
  return {
    message: `User status updated to ${status}`,
    user: {
      _id: user._id?.toString() || "",
      username: user.username!,
      email: user.email,
      status: user.status as "active" | "blocked",
    },
  };
}
