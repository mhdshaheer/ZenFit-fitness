import { PaymentHistoryDto } from "../dtos/payment.dtos";
import { IPayment } from "../models/payment.model";

export const mapToPaymentHistoryDto = (
  payment: IPayment
): PaymentHistoryDto => {
  return {
    _id: String(payment._id),
    referenceNumber: payment.paymentIntentId!,
    status: payment.paymentStatus,
    programName: payment.programName,
    price: payment.trainerEarning,
    date: payment.createdAt,
  };
};
export const mapToPaymentHistoryAdminDto = (
  payment: IPayment
): PaymentHistoryDto => {
  return {
    _id: String(payment._id),
    referenceNumber: payment.paymentIntentId!,
    status: payment.paymentStatus,
    programName: payment.programName,
    price: payment.platformFee,
    date: payment.createdAt,
  };
};
