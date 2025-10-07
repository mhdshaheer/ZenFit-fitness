export interface PaymentHistoryDto {
  _id: string;
  status: string;
  price: number;
  programName: string;
  referenceNumber: string;
  date: Date;
}
