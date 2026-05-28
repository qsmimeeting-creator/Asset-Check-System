import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Database, Globe, Save, Layers, Trash2, Plus, Edit2 } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { cn } from '../lib/utils';
import { getDepartments, saveDepartment, deleteDepartment, getRoles, saveRole, deleteRole, isSupabaseConfigured } from '../lib/api';
import { Department, Role } from '../types';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });

  const [settings, setSettings] = useState({
    language: 'th',
    notifications: true,
    autoBackup: false
  });

  const tabs = [
    { id: 'departments', name: 'ส่วนงาน / แผนก', icon: Layers },
    { id: 'roles', name: 'ระดับสิทธิ์ (Role)', icon: Shield },
    { id: 'notification', name: 'การแจ้งเตือน', icon: Bell },
    { id: 'database', name: 'การเชื่อมต่อ & สำรองข้อมูล', icon: Database },
    { id: 'language', name: 'ภาษาและภูมิภาค', icon: Globe },
  ];

  useEffect(() => {
    if (activeTab === 'departments') {
      fetchDepartments();
    } else if (activeTab === 'roles') {
      fetchRoles();
    }
  }, [activeTab]);

  const fetchDepartments = async () => {
    setIsLoadingDepts(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDepts(false);
    }
  };

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    try {
      await saveDepartment({ name: newDeptName.trim() });
      setNewDeptName('');
      fetchDepartments();
      setNotification({ isOpen: true, title: 'สำเร็จ', message: 'เพิ่มแผนกใหม่เรียบร้อยแล้ว', type: 'success' });
    } catch (error) {
      setNotification({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถเพิ่มแผนกได้', type: 'error' });
    }
  };

  const handleUpdateDept = async () => {
    if (!editingDept || !editingDept.name.trim()) return;
    try {
      await saveDepartment(editingDept);
      setEditingDept(null);
      fetchDepartments();
      setNotification({ isOpen: true, title: 'สำเร็จ', message: 'แก้ไขข้อมูลแผนกเรียบร้อยแล้ว', type: 'success' });
    } catch (error) {
      setNotification({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถแก้ไขข้อมูลแผนกได้', type: 'error' });
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('ยืนยันการลบแผนกนี้?')) return;
    try {
      await deleteDepartment(id);
      fetchDepartments();
      setNotification({ isOpen: true, title: 'สำเร็จ', message: 'ลบแผนกเรียบร้อยแล้ว', type: 'success' });
    } catch (error) {
      setNotification({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถลบแผนกได้', type: 'error' });
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      await saveRole({ name: newRoleName.trim() });
      setNewRoleName('');
      fetchRoles();
      setNotification({ isOpen: true, title: 'สำเร็จ', message: 'เพิ่มระดับสิทธิ์ใหม่เรียบร้อยแล้ว', type: 'success' });
    } catch (error) {
      setNotification({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถเพิ่มระดับสิทธิ์ได้', type: 'error' });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.name.trim()) return;
    try {
      await saveRole(editingRole);
      setEditingRole(null);
      fetchRoles();
      setNotification({ isOpen: true, title: 'สำเร็จ', message: 'แก้ไขข้อมูลระดับสิทธิ์เรียบร้อยแล้ว', type: 'success' });
    } catch (error) {
      setNotification({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถแก้ไขข้อมูลระดับสิทธิ์ได้', type: 'error' });
    }
  };

  const handleDeleteRole = async (id: string) => {
    const roleToDelete = roles.find(r => r.id === id);
    if (roleToDelete && roleToDelete.name.toLowerCase().includes('super')) {
      setNotification({ isOpen: true, title: 'ไม่อนุญาต', message: 'ไม่สามารถลบระดับสิทธิ์ Super Admin ได้', type: 'error' });
      return;
    }

    if (!confirm('ยืนยันการลบระดับสิทธิ์นี้?')) return;
    try {
      await deleteRole(id);
      fetchRoles();
      setNotification({ isOpen: true, title: 'สำเร็จ', message: 'ลบระดับสิทธิ์เรียบร้อยแล้ว', type: 'success' });
    } catch (error) {
      setNotification({ isOpen: true, title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถลบระดับสิทธิ์ได้', type: 'error' });
    }
  };

  const handleSave = () => {
    setNotification({
      isOpen: true,
      title: 'บันทึกสำเร็จ',
      message: 'การตั้งค่าสำหรับ' + (tabs.find(t => t.id === activeTab)?.name || '') + ' ถูกบันทึกเรียบร้อยแล้ว',
      type: 'success'
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">การตั้งค่าระบบ</h1>
        <p className="mt-1 text-sm text-slate-500">จัดการข้อมูลหน่วยงาน การแจ้งเตือน และข้อมูลพื้นฐานของระบบ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all",
                  activeTab === tab.id 
                    ? "text-primary bg-primary/5 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <tab.icon className={cn("w-5 h-5 mr-3", activeTab === tab.id ? "text-primary" : "text-slate-400")} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'departments' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">ส่วนงาน / แผนก</h2>
                <p className="text-sm text-slate-500">จัดการรายชื่อส่วนงานเพื่อใช้ในการลงทะเบียนครุภัณฑ์และผู้ใช้งาน</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="ชื่อแผนกใหม่..."
                    className="flex-grow rounded-xl border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleAddDept}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มส่วนงาน
                  </button>
                </div>

                <div className="space-y-2">
                  {isLoadingDepts ? (
                    <div className="py-8 text-center text-slate-400">กำลังโหลด...</div>
                  ) : departments.length > 0 ? (
                    departments.map((dept) => (
                      <div key={dept.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                        {editingDept?.id === dept.id ? (
                          <input
                            type="text"
                            value={editingDept.name}
                            onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                            className="flex-grow mr-4 rounded-lg border border-primary px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-slate-700">{dept.name}</span>
                        )}
                        <div className="flex items-center space-x-2">
                          {editingDept?.id === dept.id ? (
                            <button
                              onClick={handleUpdateDept}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingDept(dept)}
                              className="p-2 text-slate-400 hover:text-trust-blue hover:bg-trust-blue/5 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDept(dept.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                      ยังไม่มีรายการส่วนงาน
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">ระดับสิทธิ์ (Role)</h2>
                <p className="text-sm text-slate-500">จัดการรายชื่อระดับสิทธิ์การเข้าใช้งานในระบบ</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="ชื่อระดับสิทธิ์ใหม่..."
                    className="flex-grow rounded-xl border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleAddRole}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มระดับสิทธิ์
                  </button>
                </div>

                <div className="space-y-2">
                  {isLoadingRoles ? (
                    <div className="py-8 text-center text-slate-400">กำลังโหลด...</div>
                  ) : roles.length > 0 ? (
                    roles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                        {editingRole?.id === role.id ? (
                          <input
                            type="text"
                            value={editingRole.name}
                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            className="flex-grow mr-4 rounded-lg border border-primary px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-slate-700">{role.name}</span>
                        )}
                        <div className="flex items-center space-x-2">
                          {editingRole?.id === role.id ? (
                            <button
                              onClick={handleUpdateRole}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingRole(role)}
                              className="p-2 text-slate-400 hover:text-trust-blue hover:bg-trust-blue/5 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {!(role.name.toLowerCase().includes('super')) ? (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              className="p-2 text-slate-200 cursor-not-allowed rounded-lg"
                              title="ไม่สามารถลบสิทธิ์ Super Admin ได้"
                              disabled
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                      ยังไม่มีรายการระดับสิทธิ์
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notification' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">การแจ้งเตือน</h2>
                <p className="text-sm text-slate-500">ตั้งค่าการรับข้อมูลสื่อสารจากระบบ</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">รับการแจ้งเตือนงานตรวจสอบ</h3>
                    <p className="text-xs text-slate-500">แจ้งเตือนเมื่อครุภัณฑ์ถึงกำหนดการตรวจสอบรอบใหม่</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications}
                      onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-hover transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">การเชื่อมต่อฐานข้อมูล</h2>
                    <p className="text-sm text-slate-500">ตรวจสอบสถานะการเชื่อมต่อ Supabase</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight",
                    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-amber-100 text-amber-700"
                  )}>
                    {import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Connected' : 'Offline / Mock Mode'}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Database className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">Supabase Integration</p>
                      <p className="text-slate-500 mt-1">
                        {import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY 
                          ? "ระบบกำลังใช้งานฐานข้อมูลจริงจาก Supabase ข้อมูลทั้งหมดจะถูกบันทึกอย่างถาวร"
                          : "ระบบกำลังทำงานใน Offline Mode (ใช้ข้อมูลจำลอง) หากต้องการใช้ฐานข้อมูลจริง กรุณาตั้งค่า Environment Variables ใน Vercel หรือ AI Studio Settings"}
                      </p>
                    </div>
                  </div>
                  
                  {!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        <span className="font-bold underline italic block mb-1">คำแนะนำสำหรับ Vercel:</span>
                        หากคุณเห็นข้อความนี้หลังจาก Deploy ขึ้น Vercel แล้ว คุณต้องไปที่ Vercel Dashboard {">"} Settings {">"} Environment Variables และเพิ่ม <code className="bg-amber-100/50 px-1 rounded">VITE_SUPABASE_URL</code> และ <code className="bg-amber-100/50 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> จากนั้นกด Redeploy อีกครั้ง
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">สำรองข้อมูล</h2>
                  <p className="text-sm text-slate-500">จัดการข้อมูลสำรองและความปลอดภัยของข้อมูล</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">สำรองข้อมูลอัตโนมัติ</h3>
                      <p className="text-xs text-slate-500">ส่งอีเมลสำรองข้อมูล (Excel) ทุกสัปดาห์</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.autoBackup}
                        onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="pt-4 flex justify-start">
                    <button className="text-sm text-trust-blue font-semibold hover:underline">ส่งออกข้อมูลเป็น Excel (.xlsx) ทันที</button>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-hover transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    บันทึกการสำรองข้อมูล
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">ภาษาและภูมิภาค</h2>
                <p className="text-sm text-slate-500">ตั้งค่ารูปแบบการแสดงผลและภาษา</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">ภาษาประจำระบบ</h3>
                    <p className="text-xs text-slate-500">เลือกภาษาหลักที่ใช้ในการแสดงผลและรายงาน</p>
                  </div>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="rounded-lg border border-slate-300 text-sm py-1.5 px-3 outline-none"
                  >
                    <option value="th">ไทย (TH)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-hover transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการตั้งค่าภาษา
                </button>
              </div>
            </div>
          )}

          </div>
        </div>

        <NotificationModal 
          isOpen={notification.isOpen}
          onClose={() => setNotification(prev => ({...prev, isOpen: false}))}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      </div>
    );
  }
