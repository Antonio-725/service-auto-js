//types/spareParts.ts
export interface SparePart {
  id: string;
  name: string;
  partNumber?: string;
  price?: number;
  quantity?: number;
}

export interface SparePartRequest {
  id: string;
  sparePartId: string;
  vehicleId: string;
  mechanicId: string;
  quantity: number;
  totalPrice?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
  sparePart?: SparePart;
}