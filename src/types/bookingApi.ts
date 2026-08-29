export interface ApiBooking {
  id: number;
  bookedAt: string;
  bookingCode: string;
  status: string;
  totalAmount: number;
  customerId: number;
  showId: number;
}

export interface ApiBookingInput {
  bookedAt: string;
  bookingCode: string;
  status: string;
  totalAmount: number;
  customerId: number;
  showId: number;
}