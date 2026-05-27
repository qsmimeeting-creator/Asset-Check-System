export type AssetStatus = 'active' | 'damaged' | 'repair' | 'lost' | 'moved' | 'disposed';
export type UserRole = 'Super Admin' | 'Admin' | 'Inspector' | 'Viewer';

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  category_id: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  price: number;
  location_id: string;
  department_id: string;
  responsible_person: string;
  status: AssetStatus;
  next_maintenance_date: string;
  image_url?: string;
}

export interface Inspection {
  id: string;
  asset_id: string;
  checked_by: string;
  checked_at: string;
  status: AssetStatus;
  location_id: string;
  note: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  damaged: number;
  repair: number;
  lost: number;
  disposed: number;
}
