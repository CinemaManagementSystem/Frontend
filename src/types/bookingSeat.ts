export interface BookingSeat {
  id: number;
  price: number;
  status: string;
  bookingId: number;
  seatId: number;
}

export interface BookingSeatInput {
  bookingId: number;
  seatId: number;
  price?: number; 
  status?: string;
}
