export interface IPaymentCourse {
  price: number;
  courseName: string;
  courseId: string;
}
export interface PaymentHistory {
  _id: string;
  courseName: string;
  price: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
  referenceNumber: string;
}
