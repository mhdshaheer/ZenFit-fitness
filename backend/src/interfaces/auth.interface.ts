export interface IJwtPayload {
  id: string;
  role: "trainer" | "user" | "admin";
  iat: number;
  exp: number;
}
