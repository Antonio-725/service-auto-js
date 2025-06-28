// types/adminTypes.ts
import React from 'react';

// Stat card interface for dashboard overview
export interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType;
  color: string;
}

// Vehicle owner interface
export interface VehicleOwner {
  id: string;
  username: string;
  phone: string;
  email: string;
}

// Vehicle interface
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: string;
  owner: VehicleOwner;
}

// Mechanic interface
export interface Mechanic {
  id: string;
  username: string;
  phone: string;
}

// Service request status type
export type ServiceStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";

// Service request interface
export interface ServiceRequest {
  id: string;
  description: string;
  status: ServiceStatus;
  date: string;
  rating: number | null;
  createdAt: string;
  vehicle: Vehicle;
  mechanic: Mechanic | null;
  priority?: string;
}

// Invoice item interface
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Invoice status type
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue";

// Service data for invoice
export interface InvoiceService {
  id: string;
  description: string;
  status: string;
  date: string;
}

// Vehicle data for invoice
export interface InvoiceVehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
}

// User data for invoice
export interface InvoiceUser {
  id: string;
  username: string;
  email: string;
}

// Invoice response interface
export interface InvoiceResponse {
  id: string;
  serviceId: string;
  vehicleId: string;
  userId: string;
  items: InvoiceItem[];
  laborCost: number;
  partsCost: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  service?: InvoiceService;
  vehicle?: InvoiceVehicle;
  user?: InvoiceUser;
}

// Status counts interface for dashboard statistics
export interface StatusCounts extends Record<string, number> {
  Pending: number;
  "In Progress": number;
  Completed: number;
  Cancelled: number;
}

// Service update payload interface
export interface ServiceUpdatePayload {
  mechanicId?: string | null;
  status?: ServiceStatus;
  description?: string;
  priority?: string;
}

// API error interface
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Dashboard props interfaces
export interface OverviewTabProps {
  stats: StatCard[];
  statusCounts: StatusCounts;
  serviceRequests: ServiceRequest[];
  mechanics: Mechanic[];
  onAssign: (requestId: string, mechanicId: string | null, status: string) => Promise<void>;
}

export interface ServicesTabProps {
  serviceRequests: ServiceRequest[];
  mechanics: Mechanic[];
  onAssign: (requestId: string, mechanicId: string | null, status: string) => Promise<void>;
}

// Sidebar props interface
export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}