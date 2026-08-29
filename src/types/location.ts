export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string | null;
}

export interface LocationInput {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
}