export interface Show {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  ticketPrice: number;
  movieId: number;
  screenId: number;
}

export interface ShowInput {
  startTime: string;
  endTime: string;
  status: string;
  ticketPrice: number;
  movieId: number;
  screenId: number;
}