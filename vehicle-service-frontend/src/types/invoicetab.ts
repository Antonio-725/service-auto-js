interface Service {
  id: string;
  description: string;
  date: string;
  status: string;
  invoiceId?: string;
  vehicle: {
    id: string;
    name?: string;
    make?: string;
    model?: string;
    licensePlate?: string;
  };
  mechanic: {
    id: string;
  };
  createdAt: string;
}

interface SparePart {
  id: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  status: string;
  vehicleId: string;
  createdAt: string;
}

interface SparePartRequest {
  id: string;
  status: string;
  vehicleId: string;
  createdAt: string;
  quantity: number;
  sparePart?: {
    id: string;
    name: string;
    price?: number;
  };
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
interface User {
  id: string;
  username: string;
  email: string;
}

interface Invoice {
  id: string;
  //status: string;
  createdAt: string;
  totalAmount: number;
  serviceId: string;
  vehicleId: string;
  userId: string;
  items: InvoiceItem[];
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  laborCost: number;
  partsCost: number;
  tax: number;
  service?: {
    id: string;
    description: string;
    vehicle: {
      id: string;
      name?: string;
      make?: string;
      model?: string;
      licensePlate?: string;
    };
  };
  vehicle?: {
    id: string;
    name?: string;
    make?: string;
    model?: string;
    licensePlate?: string;
  };
  
}

export type{ Service, SparePart, SparePartRequest, InvoiceItem, Invoice };