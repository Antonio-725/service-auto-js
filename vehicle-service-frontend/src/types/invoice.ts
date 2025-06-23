export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Service {
  id: string;
  description: string;
  status: string;
  date: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Invoice {
  id: string;
  serviceId: string;
  vehicleId: string;
  userId: string;
  items: InvoiceItem[];
  laborCost: number;
  partsCost: number;
  tax: number;
  totalAmount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  vehicle?: Vehicle;
  user?: User;
}