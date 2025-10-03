export interface IAppError extends Error {
  status?: number;
  message: string;
}
