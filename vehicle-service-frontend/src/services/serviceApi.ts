// src/services/serviceApi.ts
import apiClient from "../utils/apiClient";

export const fetchServices = async () => {
  try {
    //const response = await apiClient.get("/api/services");
    const response=await apiClient.get("/api/services/all-vehicles")
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch services";
    throw new Error(errorMessage);
  }
};

export const fetchMechanics = async () => {
  try {
    const response = await apiClient.get("/api/users?role=mechanic");
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch mechanics";
    throw new Error(errorMessage);
  }
};

export const updateService = async (serviceId: string, updates: { 
  mechanicId?: string | null, 
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled" 
}) => {
  try {
    const response = await apiClient.put(`/api/services/${serviceId}/assign`, updates);
    return response.data.service;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update service";
    throw new Error(errorMessage);
  }
};


// export const updateService = async (serviceId: string, updates: { 
//   mechanicId?: string | null, 
//   status?: "Pending" | "In Progress" | "Completed" | "Cancelled" 
// }) => {
//   try {
//     // Validate if status is Completed and service date is in the future
//     if (updates.status === "Completed") {
//       const response = await apiClient.get(`/api/services/${serviceId}`);
//       const service = response.data;
//       const today = new Date().toISOString().split('T')[0];
//       if (service.date > today) {
//         throw new Error("Cannot complete a service before its scheduled date");
//       }
//     }

//     const response = await apiClient.put(`/api/services/${serviceId}/assign`, updates);
//     return response.data.service;
//   } catch (error: any) {
//     const errorMessage = error.response?.data?.message || error.message || "Failed to update service";
//     throw new Error(errorMessage);
//   }
// };

export const fetchAssignedServices = async () => {
  try {
    const response = await apiClient.get("/api/services/mechanic");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch assigned services";
    throw new Error(errorMessage);
  }
};