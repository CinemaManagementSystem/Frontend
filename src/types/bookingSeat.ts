export interface BookingSeat {
  id: number;
  price: number;
  status: string;
  bookingId: number;
  seatId: number;
}

export interface BookingSeatInput {
  price: number;
  status: string;
  bookingId: number;
  seatId: number;
}