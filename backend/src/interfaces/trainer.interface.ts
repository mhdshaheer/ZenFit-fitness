export interface ITrainer {
  name?: string;
  email: string;
  password?: string;
  dob?: Date;
  experience: number;
  languages: string[];
  gender?: "male" | "female" | "other";
  role: "admin" | "trainer" | "user";
}
