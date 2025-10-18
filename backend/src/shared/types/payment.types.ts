export interface CheckoutRequest {
  price: number;
  courseName: string;
  courseId: string;
}

export interface CheckoutResponse {
  url: string;
}
