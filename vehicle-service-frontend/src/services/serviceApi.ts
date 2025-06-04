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
    const errorMessage = error.response?.data?.message || "Failed to update service";
    throw new Error(errorMessage);
  }
};


