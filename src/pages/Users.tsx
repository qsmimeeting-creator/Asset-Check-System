import { useEffect, useState } from 'react';
import { getUsers, createUser, deleteUser, updateUser, getDepartments, getRoles } from '../lib/api';
import { User, Department, Role } from '../types';
import { UserPlus, Trash2, Shield, Mail, Building, Edit, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';

type FormData = {
  name: string;
  email: string;
  role: string;
  department: string;
  password?: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  });
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info'}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning'
  });
  
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchRoles();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        setNotification({
          isOpen: true,
          title: 'สำเร็จ',
          message: 'แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว',
          type: 'success'
        });
      } else {
        await createUser(data);
        setNotification({
          isOpen: true,
          title: 'สำเร็จ',
          message: 'เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว',
          type: 'success'
        });
      }
      setShowAddModal(false);
      setEditingUser(null);
      reset();
      fetchUsers();
    } catch (e) {
      setNotification({
        isOpen: true,
        title: 'ความผิดพลาด',
        message: 'ไม่สามารถดำเนินการได้',
        type: 'error'
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('department', user.department || '');
    setValue('password', ''); // Clear password for editing for security
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete && userToDelete.role.toLowerCase().includes('super')) {
      setNotification({
        isOpen: true,
        title: 'ไม่อนุญาต',
        message: 'ไม่สามารถลบผู้ใช้งานระดับสิทธิ์ Super Admin ได้',
        type: 'error'
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'ลบผู้ใช้งาน',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteUser(id);
          setNotification({
            isOpen: true,
            title: 'ลบสำเร็จ',
            message: 'ลบผู้ใช้งานออกจากระบบแล้ว',
            type: 'success'
          });
          fetchUsers();
        } catch (e) {
          setNotification({
            isOpen: true,
            title: 'ความผิดพลาด',
            message: 'ไม่สามารถลบผู้ใช้งานได้',
            type: 'error'
          });
        }
      }
    });
  };

  const getRoleStyle = (roleName: string) => {
    const lowerRole = roleName.toLowerCase();
    if (lowerRole.includes('super')) return 'bg-rose-100 text-rose-700';
    if (lowerRole.includes('admin')) return 'bg-trust-blue/10 text-trust-blue';
    if (lowerRole.includes('inspect')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">การจัดการผู้ใช้งาน</h1>
          <p className="mt-1 text-sm text-slate-500">กำหนดสิทธิ์และการเข้าถึงระบบสำหรับบุคลากร</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setEditingUser(null);
              reset();
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            เพิ่มผู้ใช้งาน
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider sm:pl-6">ชื่อ - อีเมล</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">รหัสผ่าน</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">ฝ่าย / แผนก</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">ระดับสิทธิ์</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider hidden lg:table-cell">วันที่เข้าร่วม</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">จัดการ</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-500">กำลังโหลด...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-500">ไม่พบข้อมูลผู้ใช้งาน</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-slate-500 text-sm flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-slate-400">
                      {user.password ? '••••••••' : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {user.department || '-'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", getRoleStyle(user.role))}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden lg:table-cell">
                      {format(new Date(user.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-trust-blue hover:text-trust-blue/80 p-2 hover:bg-trust-blue/5 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!(user.role.toLowerCase().includes('super')) ? (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-rose-500 hover:text-rose-700 transition-colors p-2 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            className="text-slate-300 cursor-not-allowed p-2 rounded-lg transition-colors"
                            title="ไม่สามารถลบ Super Admin ได้"
                            disabled
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  {...register('name')}
                  className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">อีเมล</label>
                <input
                  type="email"
                  required
                  {...register('email')}
                  className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3 outline-none"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">รหัสผ่าน</label>
                  <input
                    type="password"
                    required={!editingUser}
                    {...register('password')}
                    placeholder="••••••••"
                    className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3 outline-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">กำหนดรหัสผ่านสำหรับการเข้าใช้งานเบื้องต้น</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">ส่วนงาน / แผนก</label>
                <select
                  {...register('department')}
                  className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3 outline-none bg-white"
                >
                  <option value="">เลือกส่วนงาน / แผนก</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">ระดับสิทธิ์ (Role)</label>
                <select
                  {...register('role')}
                  className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3 outline-none bg-white"
                >
                  <option value="">เลือกระดับสิทธิ์</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm"
                >
                  {editingUser ? 'บันทึกการแก้ไข' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationModal 
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({...prev, isOpen: false}))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({...prev, isOpen: false}))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}

