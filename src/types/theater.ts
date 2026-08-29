export interface Theater {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
  locationId: number;
  managerId: number;
}

export interface TheaterInput {
  name: string;
  address: string;
  phone: string;
  status: string;
  locationId: number;
  managerId: number;
}