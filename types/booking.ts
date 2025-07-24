export interface ServiceSlot {
  id: string;
  date: string;
  time: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  productId: string;
  service: {
    id: string;
    name: string;
  };
  product?: {
    title: string;
    price: number;
  };
}

export interface BookingCalendarProps {
  slots: ServiceSlot[];
  onSlotDelete?: (slotId: string) => void;
  onDateSelect?: (date: Date) => void;
}

export interface DayTimeDiagramProps {
  selectedDate: Date;
  slots: ServiceSlot[];
}
