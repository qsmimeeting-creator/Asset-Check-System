import { supabase } from './supabase';
import { Asset, Inspection, DashboardStats, User } from '../types';
import { mockAssets, mockInspections, mockUsers } from './mockData';

// Polyfill for local storage state to simulate database behavior across navigation
let localAssets = [...mockAssets];
let localInspections = [...mockInspections];
let localUsers = [...mockUsers];

export const isSupabaseConfigured = () => supabase !== null;

// Assets API
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
  if (index === -1) throw new Error('Asset not found');
  localAssets[index] = { ...localAssets[index], ...updates };
  return Promise.resolve(localAssets[index]);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  let allAssets = [];
  if (supabase) {
    const { data } = await supabase.from('assets').select('status');
    allAssets = data || [];
  } else {
    allAssets = localAssets;
  }

  const stats: DashboardStats = {
    total: allAssets.length,
    active: allAssets.filter(a => a.status === 'active').length,
    damaged: allAssets.filter(a => a.status === 'damaged').length,
    repair: allAssets.filter(a => a.status === 'repair').length,
    lost: allAssets.filter(a => a.status === 'lost').length,
    disposed: allAssets.filter(a => a.status === 'disposed').length,
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
  if (index === -1) throw new Error('User not found');
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
