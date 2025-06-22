import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;

// Hash password
export const hashedPassword = async (password: string): Promise<string> => {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return hashed;
};

// Compare password and hashpassword
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
