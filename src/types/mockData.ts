import { UserRole } from "./auth";

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  status: "active" | "on-leave";
  attendance: number;
  salary: number;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: { day: string; temp: number; condition: string }[];
}

export interface Field {
  id: string;
  name: string;
  area: number; // acres
  crop: string;
  stage: CropStage;
  health: "good" | "moderate" | "poor";
  lat: number;
  lng: number;
  boundary: [number, number][];
  lastVisit: string;
  yieldPrediction: number;
  issues: number;
}

export type CropStage =
  | "land-preparation"
  | "seed-selection"
  | "sowing"
  | "irrigation"
  | "growth"
  | "flowering"
  | "maturity"
  | "harvesting"
  | "storage";
