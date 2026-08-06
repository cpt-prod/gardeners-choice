export type SiteType = "food-bank" | "harvest";

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  hours: string;
  description: string;
  resources: string[];
}
