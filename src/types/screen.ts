export interface Screen {
  id: number;
  name: string;
  screenType: string;
  status: string;
  totalSeats: number;
  theaterId: number;
}

export interface ScreenInput {
  name: string;
  screenType: string;
  status: string;
  totalSeats: number;
  theaterId: number;
}