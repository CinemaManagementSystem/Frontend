export interface Seat {
  id: number;
  price: number;
  rowName: string;
  seatNumber: string;
  seatType: string;
  status: string;
  screenId: number;
}

export interface SeatInput {
  price: number;
  rowName: string;
  seatNumber: string;
  seatType: string;
  status: string;
  screenId: number;
}