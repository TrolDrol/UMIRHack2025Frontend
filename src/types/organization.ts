// src/types/organization.ts
export interface Organization {
  id: number;
  name: string;
  inn: string;
  address: string;
  phone: string;
  userRole?: string;
}

export interface OrganizationOption {
  value: number;
  label: string;
}

export interface OrganizationCreateRequest {
  name: string;
  inn: string;
  address?: string;
  phone?: string;
}

export interface OrganizationUpdateRequest {
  name?: string;
  inn?: string;
  address?: string;
  phone?: string;
}
