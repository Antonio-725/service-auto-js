// //utils/apiClient

import axios from "axios";

// Vehicle-related interfaces
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
}

interface Mechanic {
  id: string;
  username: string;
}

interface Service {
  id: string;
  description: string;
  mechanicId: string | null;
  vehicleId: string;
  status: "In Progress" | "Completed" | "Cancelled";
  date: string;
  rating?: number;
  mechanic?: Mechanic | null;
}

interface VehicleRequest {
  make: string;
  model: string;
  year: string;
  plate: string;
}

interface RateServiceRequest {
  rating: number;
  comment?: string;
}

// Invoice-related interfaces
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceRequest {
  serviceId: string;
  vehicleId: string;
  userId: string;
  items: InvoiceItem[];
  laborCost: number;
  partsCost: number;
  tax: number;
  totalAmount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
}

interface InvoiceResponse {
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
  service?: {
    id: string;
    description: string;
    status: string;
    date: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: string;
    plate: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Spare parts interface
interface SparePartRequest {
  id: string;
  vehicleId: string;
  status: "Pending" | "Approved" | "Rejected";
  partName: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
}
interface SendInvoiceEmailRequest {
  recipientEmail: string;
}

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || "An unexpected error occurred";
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("username");
      window.location.href = "/login";
    }
    return Promise.reject(new Error(errorMessage));
  }
);

// Authentication-related API calls
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Login failed";
    throw new Error(errorMessage);
  }
};

export const verifyToken = async () => {
  try {
    const response = await apiClient.get("/api/auth/verify");
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Token verification failed";
    throw new Error(errorMessage);
  }
};

export const registerUser = async (
  username: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    const response = await apiClient.post("/api/users/register", {
      username,
      email,
      phone,
      password,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Registration failed";
    throw new Error(errorMessage);
  }
};

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("username");
  window.location.href = "/login";
};

// Invoice-related API calls
export const createInvoice = async (invoiceData: InvoiceRequest) => {
  try {
    const response = await apiClient.post("api/invoices", invoiceData);
    return response.data as InvoiceResponse;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create invoice");
  }
};

export const getInvoices = async (serviceId?: string): Promise<InvoiceResponse[]> => {
  try {
    const params = serviceId ? { serviceId } : {};
    const response = await apiClient.get("/api/invoices", { params });
    return response.data.map((invoice: InvoiceResponse) => ({
      ...invoice,
      totalAmount: Number(invoice.totalAmount) || 0,
    }));
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch invoices");
  }
};

export const updateInvoiceStatus = async (
  invoiceId: string,
  status: "Draft" | "Sent" | "Paid" | "Overdue"
) => {
  try {
    const response = await apiClient.patch(`api/invoices/${invoiceId}/status`, { status });
    return response.data as InvoiceResponse;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update invoice status");
  }
};

export const deleteInvoice = async (invoiceId: string) => {
  try {
    await apiClient.delete(`/invoices/${invoiceId}`);
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete invoice");
  }
};

export const getSparePartRequests = async (vehicleId: string, serviceCreatedAt: string) => {
  try {
    const response = await apiClient.get(`/api/spare-part-requests`, {
      params: { vehicleId, status: "Approved", createdAtGte: serviceCreatedAt },
    });
    return response.data as SparePartRequest[];
  } catch (error: any) {
    console.error("Error fetching spare part requests:", error.response?.data || error.message);
    throw new Error(error.message || "Failed to fetch spare part requests");
  }
};

// Vehicle-related API calls
export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await apiClient.get("/api/vehicles");
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch vehicles");
  }
};

export const getVehicleById = async (vehicleId: string): Promise<Vehicle> => {
  try {
    const response = await apiClient.get(`/api/vehicles/${vehicleId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch vehicle details");
  }
};

export const addVehicle = async (vehicleData: VehicleRequest): Promise<Vehicle> => {
  try {
    const response = await apiClient.post("/api/vehicles", vehicleData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to add vehicle");
  }
};

export const updateVehicle = async (vehicleId: string, vehicleData: VehicleRequest): Promise<Vehicle> => {
  try {
    const response = await apiClient.put(`/api/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update vehicle");
  }
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/vehicles/${vehicleId}`);
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete vehicle");
  }
};

// Service-related API calls
export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await apiClient.get("/api/services");
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch services");
  }
};

export const rateService = async (serviceId: string, ratingData: RateServiceRequest): Promise<void> => {
  try {
    await apiClient.patch(`/api/services/${serviceId}/rate`, ratingData);
  } catch (error: any) {
    throw new Error(error.message || "Failed to rate service");
  }
};

export const sendInvoiceEmail = async (invoiceId: string, data: SendInvoiceEmailRequest) => {
  try {
    const response = await apiClient.post(`/api/invoices/${invoiceId}/send-email`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send invoice email');
  }
};

export default apiClient;