import { inject, injectable } from "inversify";
import { IBooking } from "../../models/booking.model";
import { IBookingRepository } from "../../repositories/interface/booking.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { IBookingService } from "../interface/booking.service.interface";
import { ISlotRepository } from "../../repositories/interface/slot.repository.interface";

@injectable()
export class BookingService implements IBookingService {
  @inject(TYPES.BookingRepository)
  private readonly _bookingRepository!: IBookingRepository;
  @inject(TYPES.SlotRepository)
  private readonly _slotRepository!: ISlotRepository;
  async createBooking(
    slotId: string,
    userId: string,
    day: string,
    date: Date
  ): Promise<IBooking> {
    const slot = await this._slotRepository.findSlotById(slotId);
    if (!slot) throw new Error("Slot not found");
    const booking = await this._bookingRepository.createBooking(
      userId,
      day,
      date,
      slot
    );
    return booking;
  }
}
