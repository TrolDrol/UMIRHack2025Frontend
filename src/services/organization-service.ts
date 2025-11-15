import { apiClient } from "./api-client";
import { Organization } from "../types/api";

export const organizationService = {
  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>(
      "/api/Organizations/my"
    );
    return response.data;
  },

  async getOrganization(id: number): Promise<Organization> {
    const response = await apiClient.get<Organization>(
      `/api/Organizations/${id}`
    );
    return response.data;
  },

  async createOrganization(
    organization: Omit<Organization, "id">
  ): Promise<Organization> {
    const response = await apiClient.post<Organization>(
      "/api/Organizations",
      organization
    );
    return response.data;
  },

  async updateOrganization(
    id: number,
    organization: Partial<Organization>
  ): Promise<Organization> {
    const response = await apiClient.put<Organization>(
      `/api/Organizations/${id}`,
      organization
    );
    return response.data;
  },

  async deleteOrganization(id: number): Promise<void> {
    await apiClient.delete(`/api/Organizations/${id}`);
  },
};
