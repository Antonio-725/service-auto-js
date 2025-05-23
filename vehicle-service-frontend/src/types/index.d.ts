// types/index.ts

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  service: string;
  vehicle: string; // This could be a string or another object depending on API response
  mechanic: string;
  status: string;
  date: string;
  rating?: number; // Optional
}

export interface ServiceHistory extends Service {
  rating?: number;
}