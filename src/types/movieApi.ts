export interface ApiMovie {
  id: number;
  categoryId: number;
  title: string;
  description: string;
  posterUrl: string;
  posterPublicId: string | null;
  genre: string;
  language: string;
  durationMinutes: number;
  releaseDate: string;
  status: string;
}

export interface ApiMovieInput {
  categoryId: number;
  title: string;
  description: string;
  posterUrl: string;
  genre: string;
  language: string;
  durationMinutes: number;
  releaseDate: string;
  status: string;
}