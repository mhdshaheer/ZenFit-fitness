import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import {
    ISlotInstanceService,
    SlotInstancePaginatedResult,
    TrainerSlotInstanceFilters,
} from "../interface/slotInstance.service.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { ISlotTemplateRepository } from "../../repositories/interface/slotTemplate.repository.interface";
import {
    ISlotInstanceRepository,
    TrainerInstanceFilterOptions,
} from "../../repositories/interface/slotInstance.repository.interface";
import { ISlotTemplate } from "../../models/slotTemplate.model";
import { ISlotInstance } from "../../models/slotInstance.model";
import { IBookingRepository } from "../../repositories/interface/booking.repository.interface";
import { IProgramRepository } from "../../repositories/interface/program.repository.interface";
import { toSlotInstancePaginatedDto } from "../../dtos/slotInstance.dtos";
import { INotificationService } from "../interface/notification.service.interface";
import { IBooking } from "../../models/booking.model";

@injectable()
export class SlotInstanceService implements ISlotInstanceService {
    @inject(TYPES.SlotTemplateRepository)
    private readonly _templateRepo!: ISlotTemplateRepository;

    @inject(TYPES.SlotInstanceRepository)
    private readonly _instanceRepo!: ISlotInstanceRepository;

    @inject(TYPES.BookingRepository)
    private readonly _bookingRepo!: IBookingRepository;

    @inject(TYPES.ProgramRespository)
    private readonly _programRepo!: IProgramRepository;

    @inject(TYPES.NotificationService)
    private readonly _notificationService!: INotificationService;

    private readonly HORIZON_DAYS_DEFAULT = 10;

    async generateFutureInstancesForTemplate(
        templateId: string,
        daysAhead: number = this.HORIZON_DAYS_DEFAULT
    ): Promise<void> {
        const template = await this._templateRepo.findById(templateId);
        if (!template || !template.isActive) {
            throw new Error("Slot template not found or inactive");
        }

        const today = this.startOfDay(new Date());
        const instances: Partial<ISlotInstance>[] = [];

        for (let i = 0; i < daysAhead; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            if (!this.matchesRecurrence(template, date)) {
                continue;
            }

            instances.push({
                templateId: template._id as Types.ObjectId,
                date,
                startTime: template.startTime,
                endTime: template.endTime,
                capacity: template.capacity,
                availableCapacity: template.capacity,
                programId: template.programId,
                trainerId: template.trainerId,
                timezone: template.timezone,
                status: "OPEN",
            });
        }

        await this._instanceRepo.bulkUpsertInstances(instances);
    }

    async getInstancesByDateRange(
        trainerId: string,
        from: Date,
        to: Date
    ): Promise<ISlotInstance[]> {
        const fromDate = this.startOfDay(from);
        const toDate = this.endOfDay(to);
        return this._instanceRepo.findByTrainerAndDateRange(
            trainerId,
            fromDate,
            toDate
        );
    }

    async getInstancesForProgram(
        programId: string,
        from?: Date,
        to?: Date,
        page: number = 1,
        limit: number = 20
    ): Promise<SlotInstancePaginatedResult> {
        const sanitizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const cappedLimit = Math.min(50, Math.max(1, limit || 20));
        const start = this.startOfDay(from ?? new Date());
        const end = this.endOfDay(
            to ?? new Date(start.getTime() + this.HORIZON_DAYS_DEFAULT * 24 * 60 * 60 * 1000)
        );

        const skip = (sanitizedPage - 1) * cappedLimit;

        const [data, total] = await Promise.all([
            this._instanceRepo.findByProgramAndDateRange(programId, start, end, {
                skip,
                limit: cappedLimit,
            }),
            this._instanceRepo.countByProgramAndDateRange(programId, start, end),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / cappedLimit));
        return toSlotInstancePaginatedDto({
            data,
            pagination: {
                page: sanitizedPage,
                limit: cappedLimit,
                total,
                totalPages,
                hasNextPage: sanitizedPage < totalPages,
            },
        });
    }

    async getTrainerInstancesWithFilters(
        trainerId: string,
        filters: TrainerSlotInstanceFilters
    ): Promise<SlotInstancePaginatedResult> {
        const segment = filters.segment === "past" ? "past" : "upcoming";
        const { from: rawFrom, to: rawTo } = filters;
        const now = new Date();

        const defaultFrom = segment === "past"
            ? this.startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
            : this.startOfDay(now);
        const defaultTo = segment === "past"
            ? this.endOfDay(now)
            : this.endOfDay(new Date(now.getTime() + this.HORIZON_DAYS_DEFAULT * 24 * 60 * 60 * 1000));

        const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
        const page = Math.max(1, filters.page ?? 1);
        const skip = (page - 1) * limit;

        const buildEmptyResult = (): SlotInstancePaginatedResult =>
            toSlotInstancePaginatedDto({
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 1,
                    hasNextPage: false,
                },
            });

        let fromDate = this.startOfDay(rawFrom ?? defaultFrom);
        let toDate = this.endOfDay(rawTo ?? defaultTo);

        if (fromDate > toDate) {
            const tmp = new Date(fromDate);
            fromDate.setTime(toDate.getTime());
            toDate.setTime(tmp.getTime());
        }

        if (segment === "upcoming") {
            const upcomingFloor = defaultFrom;
            if (toDate < upcomingFloor) {
                return buildEmptyResult();
            }
            if (fromDate < upcomingFloor) {
                fromDate = new Date(upcomingFloor);
            }
        }

        if (segment === "past") {
            const pastCeiling = defaultTo;
            if (fromDate > pastCeiling) {
                return buildEmptyResult();
            }
            if (toDate > pastCeiling) {
                toDate = new Date(pastCeiling);
            }
        }

        let programIds = filters.programIds?.filter((id) => typeof id === "string" && id.trim().length);

        if (filters.search && filters.search.trim().length) {
            const searchRegex = new RegExp(filters.search.trim(), "i");
            const matchingPrograms = await this._programRepo.getProgramsFilter({
                trainerId: new Types.ObjectId(trainerId),
                title: { $regex: searchRegex },
            });

            const searchedIds = matchingPrograms.map((program) => program._id.toString());

            if (programIds && programIds.length) {
                programIds = programIds.filter((id) => searchedIds.includes(id));
            } else {
                programIds = searchedIds;
            }

            if (!programIds.length) {
                return buildEmptyResult();
            }
        }

        const repoFilters: TrainerInstanceFilterOptions = {
            from: fromDate,
            to: toDate,
            status: filters.status,
            programIds,
            skip,
            limit,
            sortOrder: segment === "past" ? -1 : 1,
            segment,
            currentDayStart: this.startOfDay(now),
            currentTimeString: this.formatTime24(now),
        };

        const [data, total] = await Promise.all([
            this._instanceRepo.findByTrainerWithFilters(trainerId, repoFilters),
            this._instanceRepo.countByTrainerWithFilters(trainerId, {
                ...repoFilters,
                skip: undefined,
                limit: undefined,
            }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return toSlotInstancePaginatedDto({
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
            },
        });
    }

    async cancelInstance(
        instanceId: string,
        trainerId: string
    ): Promise<ISlotInstance> {
        const instance = await this._instanceRepo.findById(instanceId);
        if (!instance) {
            throw new Error("Slot instance not found");
        }

        if (instance.trainerId.toString() !== trainerId) {
            throw new Error("Not authorized to cancel this slot");
        }

        if (instance.status === "CANCELLED") {
            return instance;
        }

        const updated = await this._instanceRepo.updateStatus(
            instanceId,
            "CANCELLED"
        );

        if (!updated) {
            throw new Error("Unable to cancel slot instance");
        }

        const affectedBookings = await this._bookingRepo.cancelBookingsBySlotId(
            instanceId
        );

        await this.notifyUsersOfInstanceCancellation(updated, affectedBookings);

        return updated;
    }

    async cancelFutureInstancesForTemplate(
        templateId: string,
        trainerId: string
    ): Promise<number> {
        const template = await this._templateRepo.findById(templateId);
        if (!template) {
            throw new Error("Slot template not found");
        }

        if (template.trainerId.toString() !== trainerId) {
            throw new Error("Not authorized to modify this template");
        }

        const now = this.startOfDay(new Date());
        const futureHorizon = new Date(now);
        futureHorizon.setFullYear(futureHorizon.getFullYear() + 1);

        const futureInstances = await this._instanceRepo.findByTemplateAndDateRange(
            templateId,
            now,
            futureHorizon
        );

        const cancelledCount = await this._instanceRepo.cancelUpcomingByTemplate(
            templateId,
            now
        );

        await Promise.all(
            futureInstances.map(async (instance) => {
                const bookings = await this._bookingRepo.cancelBookingsBySlotId(
                    (instance._id as Types.ObjectId).toString()
                );
                await this.notifyUsersOfInstanceCancellation(instance, bookings);
            })
        );

        return cancelledCount;
    }

    private async notifyUsersOfInstanceCancellation(
        instance: ISlotInstance,
        bookings: IBooking[]
    ): Promise<void> {
        if (!bookings.length) {
            return;
        }

        const sessionDate = new Date(instance.date);
        const formattedDate = sessionDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });

        await Promise.all(
            bookings.map((booking) => {
                const receiverId = booking.userId.toString();
                const programTitle =
                    booking.snapshot?.programTitle ?? "training session";
                const title = "Session cancelled";
                const message = `${programTitle} scheduled on ${formattedDate} at ${instance.startTime} has been cancelled. We'll notify you when a new slot is available.`;

                return this._notificationService.createNotification(
                    receiverId,
                    "user",
                    title,
                    message
                );
            })
        );
    }

    private startOfDay(date: Date): Date {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private endOfDay(date: Date): Date {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    private formatTime24(date: Date): string {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    private matchesRecurrence(template: ISlotTemplate, date: Date): boolean {
        const recurrence = template.recurrence;
        if (!recurrence || !recurrence.type) {
            return false;
        }

        switch (recurrence.type) {
            case "DAILY": {
                const interval = Math.max(1, recurrence.intervalDays ?? 1);
                if (interval === 1) {
                    return true;
                }
                const templateCreated = template.createdAt
                    ? this.startOfDay(new Date(template.createdAt))
                    : this.startOfDay(new Date());
                const diffDays = Math.floor(
                    (this.startOfDay(date).getTime() - templateCreated.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return diffDays >= 0 && diffDays % interval === 0;
            }
            case "WEEKLY": {
                const days = recurrence.daysOfWeek ?? [];
                if (!days.length) {
                    return false;
                }
                return days.includes(this.getWeekdayAbbr(date));
            }
            case "CUSTOM": {
                const specificDates = recurrence.specificDates ?? [];
                if (!specificDates.length) {
                    return false;
                }
                const target = this.startOfDay(date).getTime();
                return specificDates.some((d) => {
                    const candidate = this.startOfDay(new Date(d));
                    return candidate.getTime() === target;
                });
            }
            default:
                return true;
        }
    }

    private getWeekdayAbbr(date: Date): string {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[date.getDay()];
    }
}
