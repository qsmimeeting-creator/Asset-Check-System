import { supabase } from './supabase';
import { Asset, Inspection, DashboardStats, User, Department, Role, AppNotification } from '../types';
import { mockAssets, mockInspections, mockUsers } from './mockData';

// Polyfill for local storage state to simulate database behavior across navigation
let localAssets = [...mockAssets];
let localInspections = [...mockInspections];
let localUsers = [...mockUsers];

export const isSupabaseConfigured = () => supabase !== null;

export async function login(email: string, password: string): Promise<User> {
  if (supabase) {
    // 1. Try to sign in with Supabase Auth first
    // This is the source of truth for passwords after a reset
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Fallback for users not yet in Auth but in our table (initial migration state)
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (tableError || !tableData) {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      return tableData;
    }

    // 2. Auth successful, now get the user profile from the custom table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError || !userData) {
      // User is in Auth but not in our table? This shouldn't happen based on current logic
      // But we can create a profile for them if needed. 
      // For now, let's just let them in if they are an admin.
      throw new Error('ไม่พบข้อมูลโปรไฟล์ผู้ใช้งานในระบบ');
    }

    // 3. Lazy Sync: If the table password is different from what we used to login, update it
    // This ensures the "Table Editor" eventually reflects the correct password
    if (userData.password !== password) {
      await supabase
        .from('users')
        .update({ password: password })
        .eq('email', email);
    }

    return userData;
  }
  
  // Mock login fallback
  const user = localUsers.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }
  return user;
}

// Roles API

const localRoles: Role[] = [
  { id: 'role_1', name: 'Super Admin' },
  { id: 'role_2', name: 'Admin' },
  { id: 'role_3', name: 'Inspector' },
  { id: 'role_4', name: 'Viewer' },
];

export async function getRoles(): Promise<Role[]> {
  if (supabase) {
    const { data } = await supabase.from('roles').select('*').order('name');
    return (data || []).sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }
  return [...localRoles].sort((a, b) => a.name.localeCompare(b.name, 'th'));
}

export async function saveRole(role: Partial<Role>): Promise<Role> {
  if (supabase) {
    const { data, error } = await supabase
      .from('roles')
      .upsert(role)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  
  if (role.id) {
    const index = localRoles.findIndex(r => r.id === role.id);
    if (index !== -1) localRoles[index] = { ...localRoles[index], ...role } as Role;
    return localRoles[index];
  } else {
    const newRole = { ...role, id: `role_${Date.now()}` } as Role;
    localRoles.push(newRole);
    return newRole;
  }
}

export async function deleteRole(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const index = localRoles.findIndex(r => r.id === id);
  if (index !== -1) localRoles.splice(index, 1);
}

// Departments API
const localDepartments: Department[] = [
  { id: 'dept_1', name: 'ฝ่ายบริหารงานทั่วไป' },
  { id: 'dept_2', name: 'ฝ่ายสารสนเทศ' },
  { id: 'dept_3', name: 'ฝ่ายการตลาด' },
  { id: 'dept_4', name: 'ฝ่ายบัญชีและการเงิน' },
  { id: 'dept_5', name: 'ฝ่ายวิชาการ' },
];

export async function getDepartments(): Promise<Department[]> {
  if (supabase) {
    const { data } = await supabase.from('departments').select('*').order('name');
    return (data || []).sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }
  return [...localDepartments].sort((a, b) => a.name.localeCompare(b.name, 'th'));
}

export async function saveDepartment(dept: Partial<Department>): Promise<Department> {
  if (supabase) {
    const { data, error } = await supabase
      .from('departments')
      .upsert(dept)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  
  if (dept.id) {
    const index = localDepartments.findIndex(d => d.id === dept.id);
    if (index !== -1) localDepartments[index] = { ...localDepartments[index], ...dept } as Department;
    return localDepartments[index];
  } else {
    const newDept = { ...dept, id: `dept_${Date.now()}` } as Department;
    localDepartments.push(newDept);
    return newDept;
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const index = localDepartments.findIndex(d => d.id === id);
  if (index !== -1) localDepartments.splice(index, 1);
}

export async function getAssets(): Promise<Asset[]> {
  if (supabase) {
    const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  // Fallback
  return Promise.resolve([...localAssets]);
}

export async function getAssetById(id: string): Promise<Asset | null> {
  if (supabase) {
    const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }
  return Promise.resolve(localAssets.find(a => a.id === id) || null);
}

export async function getAssetByCode(code: string): Promise<Asset | null> {
  if (supabase) {
    const { data, error } = await supabase.from('assets').select('*').eq('asset_code', code).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }
  return Promise.resolve(localAssets.find(a => a.asset_code === code) || null);
}

export async function createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
  if (supabase) {
    const { data, error } = await supabase.from('assets').insert([asset]).select().single();
    if (error) throw error;
    return data;
  }
  
  const newAsset = { ...asset, id: `asset_${Date.now()}` } as Asset;
  localAssets = [newAsset, ...localAssets];
  return Promise.resolve(newAsset);
}

export async function updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
  if (supabase) {
    const { data, error } = await supabase.from('assets').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  
  const index = localAssets.findIndex(a => a.id === id);
  if (index === -1) throw new Error('ไม่พบข้อมูลครุภัณฑ์');
  localAssets[index] = { ...localAssets[index], ...updates };
  return Promise.resolve(localAssets[index]);
}

export async function getDashboardStats(departmentId?: string): Promise<DashboardStats> {
  let allAssets: Asset[] = [];
  if (supabase) {
    let query = supabase.from('assets').select('*');
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    const { data } = await query;
    allAssets = data || [];
  } else {
    allAssets = departmentId 
      ? localAssets.filter(a => a.department_id === departmentId)
      : localAssets;
  }

  // Get assets with upcoming maintenance (next 30 days)
  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  const upcomingMaintenance = allAssets
    .filter(a => {
      if (!a.next_maintenance_date) return false;
      const mDate = new Date(a.next_maintenance_date);
      return mDate >= now && mDate <= next30Days;
    })
    .sort((a, b) => new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime());

  const stats: DashboardStats = {
    total: allAssets.length,
    active: allAssets.filter(a => a.status === 'active').length,
    damaged: allAssets.filter(a => a.status === 'damaged').length,
    repair: allAssets.filter(a => a.status === 'repair').length,
    lost: allAssets.filter(a => a.status === 'lost').length,
    disposed: allAssets.filter(a => a.status === 'disposed').length,
    upcomingMaintenance: upcomingMaintenance.slice(0, 5), // Only top 5
  };
  return Promise.resolve(stats);
}

export async function deleteAsset(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  
  localAssets = localAssets.filter(a => a.id !== id);
  return Promise.resolve();
}

// Inspections API
export async function getInspections(assetId: string): Promise<Inspection[]> {
  if (supabase) {
    const { data, error } = await supabase.from('inspections').select('*').eq('asset_id', assetId).order('checked_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return Promise.resolve(localInspections.filter(i => i.asset_id === assetId));
}

export async function addInspection(inspection: Omit<Inspection, 'id'>): Promise<Inspection> {
  if (supabase) {
    const { data, error } = await supabase.from('inspections').insert([inspection]).select().single();
    if (error) throw error;
    
    // Also update asset status automatically in Supabase
    await supabase.from('assets').update({ 
      status: inspection.status, 
      location_id: inspection.location_id 
    }).eq('id', inspection.asset_id);
    
    return data;
  }
  
  const newInsp = { ...inspection, id: `insp_${Date.now()}` } as Inspection;
  localInspections = [newInsp, ...localInspections];
  
  // Update local asset
  const assetIndex = localAssets.findIndex(a => a.id === inspection.asset_id);
  if (assetIndex !== -1) {
    localAssets[assetIndex].status = inspection.status;
    localAssets[assetIndex].location_id = inspection.location_id;
  }
  
  return Promise.resolve(newInsp);
}

// Users API
export async function getUsers(): Promise<User[]> {
  if (supabase) {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return Promise.resolve([...localUsers]);
}

export async function createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
  if (supabase) {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw error;
    return data;
  }
  
  const newUser = { 
    ...user, 
    id: `user_${Date.now()}`,
    created_at: new Date().toISOString()
  } as User;
  localUsers = [newUser, ...localUsers];
  return Promise.resolve(newUser);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  if (supabase) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  
  const index = localUsers.findIndex(u => u.id === id);
  if (index === -1) throw new Error('ไม่พบข้อมูลผู้ใช้งาน');
  localUsers[index] = { ...localUsers[index], ...updates };
  return Promise.resolve(localUsers[index]);
}

export async function deleteUser(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  
  localUsers = localUsers.filter(u => u.id !== id);
  return Promise.resolve();
}

export async function getAllInspections(): Promise<Inspection[]> {
  if (supabase) {
    const { data, error } = await supabase.from('inspections').select('*').order('checked_at', { ascending: false }).limit(20);
    if (error) throw error;
    return data || [];
  }
  return Promise.resolve([...localInspections].sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime()).slice(0, 20));
}

export async function getNotifications(): Promise<AppNotification[]> {
  const assets = await getAssets();
  const recentInspections = await getAllInspections();
  const now = new Date();
  
  // Time thresholds
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);
  
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(now.getDate() - 2);
  
  const notifications: AppNotification[] = [];

  // 1. Maintenance Notifications
  assets.forEach(a => {
    if (a.next_maintenance_date) {
      const mDate = new Date(a.next_maintenance_date);
      if (mDate <= sevenDaysFromNow && mDate >= now) {
        notifications.push({
          id: `m-${a.id}-${a.next_maintenance_date}`,
          title: 'ใกล้ถึงกำหนดซ่อมบำรุง',
          message: `${a.name} (${a.asset_code})`,
          type: 'maintenance',
          created_at: a.next_maintenance_date,
          is_read: false,
          related_id: a.id
        });
      }
    }

    // 2. New Asset Notifications (added in last 2 days)
    if (a.created_at) {
      const cDate = new Date(a.created_at);
      if (cDate >= twoDaysAgo) {
        notifications.push({
          id: `new-${a.id}`,
          title: 'เพิ่มครุภัณฑ์ใหม่',
          message: `${a.name} (${a.asset_code}) ได้รับการเพิ่มเข้าระบบ`,
          type: 'system',
          created_at: a.created_at,
          is_read: false,
          related_id: a.id
        });
      }
    }
  });

  // 3. Recent Inspection / Status Change Notifications
  const statusLabels: Record<string, string> = {
    active: 'ปกติ',
    damaged: 'ชำรุด',
    repair: 'รอซ่อม',
    lost: 'สูญหาย',
    moved: 'ย้ายสถานที่',
    disposed: 'จำหน่ายออก'
  };

  recentInspections.forEach(insp => {
    const asset = assets.find(a => a.id === insp.asset_id);
    if (asset) {
      notifications.push({
        id: `insp-${insp.id}`,
        title: `อัปเดตสถานะ: ${statusLabels[insp.status] || insp.status}`,
        message: `${asset.name} - ${insp.note || 'ไม่มีระบุหมายเหตุ'}`,
        type: 'status',
        created_at: insp.checked_at,
        is_read: false,
        related_id: asset.id
      });
    }
  });

  // Deduplicate by ID and sort
  const uniqueNotifications = Array.from(new Map(notifications.map(item => [item.id, item])).values());
  return uniqueNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function seedMockData(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    // Seed Roles
    const { error: roleError } = await supabase.from('roles').upsert(localRoles);
    if (roleError) throw new Error(`Role seed error: ${roleError.message}`);

    // Seed Departments
    const { error: deptError } = await supabase.from('departments').upsert(localDepartments);
    if (deptError) throw new Error(`Department seed error: ${deptError.message}`);

    // Seed Users (need to remove created_at if it's auto-generated, or keep if allowed)
    const usersToSeed = mockUsers.map(({ id, ...u }) => u);
    const { error: userError } = await supabase.from('users').insert(usersToSeed);
    if (userError) throw new Error(`User seed error: ${userError.message}`);

    // Seed Assets
    const assetsToSeed = mockAssets.map(({ id, ...a }) => a);
    const { error: assetError } = await supabase.from('assets').insert(assetsToSeed);
    if (assetError) throw new Error(`Asset seed error: ${assetError.message}`);

    // Seed Inspections
    const inspectionsToSeed = mockInspections.map(({ id, ...i }) => i);
    const { error: inspError } = await supabase.from('inspections').insert(inspectionsToSeed);
    if (inspError) throw new Error(`Inspection seed error: ${inspError.message}`);

    return { success: true, message: 'Seed data successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
