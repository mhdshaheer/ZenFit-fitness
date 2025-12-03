export interface IProgramCreateSlot {
  id: string;
  title: string;
  duration: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'CUSTOM';

export interface SlotRecurrence {
  type: RecurrenceType;
  daysOfWeek?: string[];
  intervalDays?: number;
  specificDates?: string[];
}

export interface ISlotTemplateResponse {
  _id: string;
  trainerId: string;
  programId: string;
  recurrence: SlotRecurrence;
  startTime: string;
  endTime: string;
  capacity: number;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSlotTemplatePayload {
  programId: string;
  recurrence: SlotRecurrence;
  startTime: string;
  endTime: string;
  capacity: number;
  timezone: string;
  isActive?: boolean;
}

export type IUpdateSlotTemplatePayload = Partial<ICreateSlotTemplatePayload>;

export interface TimeOption {
  display: string;
  value: string;
  minutes: number;
}

export interface IDay {
  name: string;
  value: string;
  selected: boolean;
}

export interface ISlotInstanceDto {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableCapacity: number;
  timezone: string;
  programId: string;
  trainerId: string;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
}

export type ISlotInstancePublic = ISlotInstanceDto;

export interface ISlotInstancePaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ISlotInstancePaginatedResponse {
  data: ISlotInstancePublic[];
  pagination: ISlotInstancePaginationMeta;
}
