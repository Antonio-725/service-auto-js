import apiClient from '../utils/apiClient';

// Define SparePart type
export interface SparePart {
  id: string;
  name: string;
  price: number;
  quantity: number;
  picture?: string;
  criticalLevel: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define SparePartRequest type
// sparePartApi.ts
export interface SparePartRequest {
  id: string;
  sparePartId: string;
  vehicleId: string;
  mechanicId: string;
  serviceId: string; // Add serviceId
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  sparePart?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    plate: string;
  };
  mechanic?: {
    id: string;
    username: string;
    email: string;
  };
  service?: { // Add service association
    id: string;
    description: string;
    date: string;
  };
}

// export interface SparePartRequest {
//   id: string;
//   sparePartId: string;
//   vehicleId: string;
//   mechanicId: string;
//   quantity: number;
//   totalPrice: number;
//   status: 'Pending' | 'Approved' | 'Rejected';
//   createdAt: string;
//   updatedAt: string;
//   sparePart?: {
//     id: string;
//     name: string;
//     price: number;
//     quantity: number;
//   };
//   vehicle?: {
//     id: string;
//     make: string;
//     model: string;
//     plate: string;
//   };
//   mechanic?: {
//     id: string;
//     username: string;
//     email: string;
//   };
// }

const API_URL = '/api/spare-parts';
const REQUEST_API_URL = '/api/spare-part-requests';

/**
 * Fetch all spare parts
 */
export const fetchSpareParts = async (): Promise<SparePart[]> => {
  try {
    const response = await apiClient.get<SparePart[]>(API_URL);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch spare parts';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch a single spare part by ID
 */
export const fetchSparePartById = async (id: string): Promise<SparePart> => {
  try {
    const response = await apiClient.get<SparePart>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch spare part';
    throw new Error(errorMessage);
  }
};

/**
 * Create new spare part
 */
export const createSparePart = async (
  data: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SparePart> => {
  try {
    const response = await apiClient.post<{ message: string; sparePart: SparePart }>(API_URL, data);
    return response.data.sparePart;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to create spare part';
    throw new Error(errorMessage);
  }
};

/**
 * Update existing spare part
 */
export const updateSparePart = async (
  id: string,
  data: Partial<Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<SparePart> => {
  try {
    const response = await apiClient.put<{ message: string; sparePart: SparePart }>(`${API_URL}/${id}`, data);
    return response.data.sparePart;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update spare part';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a spare part
 */
export const deleteSparePart = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to delete spare part';
    throw new Error(errorMessage);
  }
};

/**
 * Upload image and return URL
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<{ imageUrl: string }>(
      `${API_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.imageUrl;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to upload image';
    throw new Error(errorMessage);
  }
};

/**
 * Update spare part quantity
 */
export const updateSparePartQuantity = async (id: string, reduceBy: number): Promise<SparePart> => {
  try {
    const response = await apiClient.patch<{ message: string; sparePart: SparePart }>(
      `${API_URL}/${id}/quantity`,
      { reduceBy }
    );
    return response.data.sparePart;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update spare part quantity';
    throw new Error(errorMessage);
  }
};

/**
 * Create a spare part request
 */

export const createSparePartRequest = async (request: {
  sparePartId: string;
  vehicleId: string;
  mechanicId: string;
  serviceId: string; // Added serviceId
  quantity: number;
  totalPrice: number;
}) => {
  try {
    const response = await apiClient.post('/api/spare-part-requests', request);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create spare part request');
  }
};



/**
 * Update spare part request status
 */
export const updateSparePartRequestStatus = async (
  id: string,
  status: 'Approved' | 'Rejected'
): Promise<SparePartRequest> => {
  try {
    const response = await apiClient.patch<{ message: string; request: SparePartRequest }>(
      `${REQUEST_API_URL}/${id}/status`,
      { status }
    );
    return response.data.request;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update spare part request status';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch recent requests for a specific mechanic
 */
export const fetchRecentRequestsByMechanic = async (): Promise<SparePartRequest[]> => {
  try {
    const response = await apiClient.get<SparePartRequest[]>(`${REQUEST_API_URL}/mechanic`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch recent requests';
    throw new Error(errorMessage);
  }
};

// sparePartApi.ts
/**
 * Fetch all spare part requests
 */
export const fetchSparePartRequests = async (serviceId?: string): Promise<SparePartRequest[]> => {
  try {
    const params: { serviceId?: string; status?: string } = {};
    if (serviceId) {
      params.serviceId = serviceId;
    }
    const response = await apiClient.get<SparePartRequest[]>(REQUEST_API_URL, { params });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch spare part requests';
    throw new Error(errorMessage);
  }
};
