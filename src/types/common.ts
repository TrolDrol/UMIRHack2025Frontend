// Общие типы
export interface BaseEntity {
  id: number;
  createdAt: string;
}

export interface ListResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
