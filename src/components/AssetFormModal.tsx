import { useForm } from 'react-hook-form';
import { Asset, AssetStatus } from '../types';
import { X } from 'lucide-react';
import { useEffect } from 'react';

type FormData = Omit<Asset, 'id'>;

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData?: Asset | null;
  title: string;
}

export default function AssetFormModal({ isOpen, onClose, onSubmit, initialData, title }: AssetFormModalProps) {
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        asset_code: '',
        name: '',
        category_id: '',
        brand: '',
        model: '',
        serial_number: '',
        purchase_date: new Date().toISOString().split('T')[0],
        price: 0,
        location_id: '',
        department_id: '',
        responsible_person: '',
        status: 'active',
        next_maintenance_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">รหัสครุภัณฑ์</label>
              <input
                {...register('asset_code', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="เช่น 7440-001-0001"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">ชื่อรายการ</label>
              <input
                {...register('name', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ชื่อครุภัณฑ์"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">หมวดหมู่</label>
              <input
                {...register('category_id', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="คอมพิวเตอร์, เฟอร์นิเจอร์..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">หมายเลขซีเรียล (S/N)</label>
              <input
                {...register('serial_number')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">ยี่ห้อ</label>
              <input
                {...register('brand')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">รุ่น</label>
              <input
                {...register('model')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">ราคา</label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">วันที่ได้มา</label>
              <input
                type="date"
                {...register('purchase_date')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">สถานที่ตั้ง</label>
              <input
                {...register('location_id')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">ฝ่าย / แผนก</label>
              <input
                {...register('department_id')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">ผู้รับผิดชอบ</label>
              <input
                {...register('responsible_person')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">สถานะ</label>
              <select
                {...register('status')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="active">ปกติ</option>
                <option value="damaged">ชำรุด</option>
                <option value="repair">รอซ่อม</option>
                <option value="lost">สูญหาย</option>
                <option value="moved">ย้ายสถานที่</option>
                <option value="disposed">จำหน่ายแล้ว</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
