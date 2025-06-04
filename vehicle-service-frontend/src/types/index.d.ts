// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'mechanic' | 'customer';
  createdAt: string;
  updatedAt: string;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

// Service Request Types
export type ServiceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type ServicePriority = 'Low' | 'Medium' | 'High';

export interface ServiceRequest {
  id: string;
  description: string;
  status: ServiceStatus;
  date: string;
  rating: number | null;
  priority?: ServicePriority;
  createdAt: string;
  updatedAt: string;
  vehicle: Vehicle;
  mechanic: User | null;
}

// For the service history/logs
export interface ServiceHistory {
  id: string;
  serviceType: string;
  description: string;
  vehicle: Vehicle;
  mechanic: User;
  status: ServiceStatus;
  date: string;
  rating?: number;
  notes?: string;
  createdAt: string;
}

// Dashboard Statistics Types
export interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType;
  color: 'blue' | 'orange' | 'yellow' | 'green' | 'purple' | 'red';
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path?: string;
  children?: NavigationItem[];
}

// Chart Data Types
export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface ServiceFormValues {
  vehicleId: string;
  description: string;
  priority: ServicePriority;
  serviceType: string;
  notes?: string;
}

// Mechanic Types
export interface Mechanic extends User {
  specialization?: string;
  available: boolean;
  currentWorkload: number;
}

// Status Count Types
export interface StatusCounts {
  Pending: number;
  'In Progress': number;
  Completed: number;
  Cancelled: number;
}

export interface StatusCountsByDate {
  [date: string]: StatusCounts;
}
