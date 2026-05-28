import { Asset, Inspection, User } from '../types';

export const mockAssets: Asset[] = [
  {
    id: 'asset_001',
    asset_code: '7440-001-0001',
    name: 'เครื่องคอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex',
    category_id: 'คอมพิวเตอร์',
    brand: 'Dell',
    model: 'OptiPlex 7090',
    serial_number: 'SN9988776655',
    purchase_date: '2023-01-15',
    price: 32000,
    location_id: 'ห้อง 101 (แผนกการเงิน)',
    department_id: 'ฝ่ายบริหารงานทั่วไป',
    responsible_person: 'นายสมชาย ใจดี',
    status: 'active',
    next_maintenance_date: '2027-01-15'
  },
  {
    id: 'asset_002',
    asset_code: '7440-001-0002',
    name: 'เครื่องพิมพ์เลเซอร์ HP LaserJet',
    category_id: 'เครื่องพิมพ์',
    brand: 'HP',
    model: 'M404dn',
    serial_number: 'VNB345678',
    purchase_date: '2023-05-10',
    price: 8500,
    location_id: 'ห้อง 102 (แผนกบุคคล)',
    department_id: 'ฝ่ายบริหารงานทั่วไป',
    responsible_person: 'นางสาวมาลี สุขสบาย',
    status: 'damaged',
    next_maintenance_date: '2026-06-10'
  },
  {
    id: 'asset_003',
    asset_code: '7440-001-0003',
    name: 'โน้ตบุ๊ก Lenovo ThinkPad',
    category_id: 'คอมพิวเตอร์',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen2',
    serial_number: 'PF3A1B2C',
    purchase_date: '2024-02-20',
    price: 45000,
    location_id: 'ห้อง 205 (แผนก IT)',
    department_id: 'ฝ่ายสารสนเทศ',
    responsible_person: 'นายวิชัย รักดี',
    status: 'active',
    next_maintenance_date: '2027-02-20'
  },
  {
    id: 'asset_004',
    asset_code: '7440-001-0004',
    name: 'สวิตช์เครือข่าย Cisco Catalyst',
    category_id: 'เน็ตเวิร์ก',
    brand: 'Cisco',
    model: 'C9200-48P',
    serial_number: 'FOC23456789',
    purchase_date: '2022-11-05',
    price: 120000,
    location_id: 'ห้อง Server',
    department_id: 'ฝ่ายสารสนเทศ',
    responsible_person: 'นายวิชัย รักดี',
    status: 'repair',
    next_maintenance_date: '2026-06-25'
  },
  {
    id: 'asset_005',
    asset_code: '7440-001-0005',
    name: 'เก้าอี้สำนักงานเพื่อสุขภาพ',
    category_id: 'เฟอร์นิเจอร์',
    brand: 'Steelcase',
    model: 'Series 1',
    serial_number: 'SC-100293',
    purchase_date: '2023-08-12',
    price: 15000,
    location_id: 'ห้อง 303 (แผนกการตลาด)',
    department_id: 'ฝ่ายการตลาด',
    responsible_person: 'นางสาวสุดา ยินดี',
    status: 'active',
    next_maintenance_date: '2030-08-12'
  }
];

export const mockUsers: User[] = [
  {
    id: 'user_001',
    name: 'แอดมิน สูงสุด',
    email: 'admin@company.com',
    password: 'password123',
    role: 'Super Admin',
    department: 'ฝ่ายสารสนเทศ',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user_002',
    name: 'นายสมชาย ใจดี',
    email: 'somchai@company.com',
    password: 'password123',
    role: 'Admin',
    department: 'ฝ่ายบริหารงานทั่วไป',
    created_at: '2024-02-15T09:00:00Z'
  },
  {
    id: 'user_003',
    name: 'นางสาวมาลี สุขสบาย',
    email: 'malee@company.com',
    password: 'password123',
    role: 'Inspector',
    department: 'ฝ่ายบริหารงานทั่วไป',
    created_at: '2024-03-20T10:30:00Z'
  },
  {
    id: 'user_004',
    name: 'นายวิชัย รักดี',
    email: 'wichai@company.com',
    password: 'password123',
    role: 'Viewer',
    department: 'ฝ่ายสารสนเทศ',
    created_at: '2024-04-10T14:00:00Z'
  }
];

export const mockInspections: Inspection[] = [
  {
    id: 'insp_001',
    asset_id: 'asset_001',
    checked_by: 'เจ้าหน้าที่ตรวจสอบ ก',
    checked_at: '2025-01-10T10:00:00Z',
    status: 'active',
    location_id: 'ห้อง 101 (แผนกการเงิน)',
    note: 'ใช้งานได้ปกติดีมาก'
  },
  {
    id: 'insp_002',
    asset_id: 'asset_002',
    checked_by: 'เจ้าหน้าที่ตรวจสอบ ข',
    checked_at: '2025-05-12T14:30:00Z',
    status: 'damaged',
    location_id: 'ห้อง 102 (แผนกบุคคล)',
    note: 'กระดาษติดบ่อย ต้องการการเปลี่ยนลูกกลิ้ง'
  }
];
