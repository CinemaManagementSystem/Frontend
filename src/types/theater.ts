export interface Theater {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
  locationId: number;
  managerId: number;
  imageUrl?: string | null;
}

export interface TheaterInput {
  name: string;
  address: string;
  phone: string;
  status: string;
  locationId: number;
  managerId: number;
  imageUrl?: string | null;
}