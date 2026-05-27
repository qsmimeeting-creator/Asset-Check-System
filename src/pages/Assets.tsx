import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssets, createAsset, deleteAsset } from '../lib/api';
import { Asset, AssetStatus } from '../types';
import { Plus, Search, Filter, Trash2, QrCode } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import AssetFormModal from '../components/AssetFormModal';
import NotificationModal from '../components/NotificationModal';

const statusStyles: Record<AssetStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  damaged: 'bg-rose-100 text-rose-800',
  repair: 'bg-amber-100 text-amber-800',
  lost: 'bg-slate-100 text-slate-800',
  moved: 'bg-blue-100 text-blue-800',
  disposed: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<AssetStatus, string> = {
  active: 'ปกติ',
  damaged: 'ชำรุด',
  repair: 'รอซ่อม',
  lost: 'สูญหาย',
  moved: 'ย้ายสถานที่',
  disposed: 'จำหน่ายแล้ว',
};

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  const fetchAssets = () => {
    setLoading(true);
    getAssets().then(data => {
      setAssets(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async (data: any) => {
    try {
      await createAsset(data);
      setIsModalOpen(false);
      setNotification({
        isOpen: true,
        title: 'สำเร็จ',
        message: 'เพิ่มข้อมูลครุภัณฑ์เรียบร้อยแล้ว',
        type: 'success'
      });
      fetchAssets();
    } catch (e) {
      setNotification({
        isOpen: true,
        title: 'ความผิดพลาด',
        message: 'ไม่สามารถเพิ่มข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${name}?`)) {
      try {
        await deleteAsset(id);
        setNotification({
          isOpen: true,
          title: 'ลบสำเร็จ',
          message: 'ลบข้อมูลครุภัณฑ์ออกจากระบบแล้ว',
          type: 'success'
        });
        fetchAssets();
      } catch (e) {
        setNotification({
          isOpen: true,
          title: 'ความผิดพลาด',
          message: 'ไม่สามารถลบข้อมูลได้',
          type: 'error'
        });
      }
    }
  };

  const filtered = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.asset_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">คลังครุภัณฑ์</h1>
          <p className="mt-1 text-sm text-slate-500">จัดการ ติดตาม และอัปเดตข้อมูลครุภัณฑ์ทั้งหมดในระบบ</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <Link
            to="/scan"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
          >
            <QrCode className="w-4 h-4 mr-2" />
            สแกน QR
          </Link>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มครุภัณฑ์
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full sm:w-auto">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
            placeholder="ค้นหาด้วยรหัสหรือชื่อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center px-4 py-2.5 space-x-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4" />
          <span>ตัวกรอง</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider sm:pl-6">รหัส / ชื่อรายการ</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider hidden md:table-cell">สถานที่ตั้ง</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">สถานะ</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">จัดการ</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-500">กำลังโหลดข้อมูล...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-500">ไม่พบรายการครุภัณฑ์</td></tr>
              ) : (
                filtered.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center font-display font-medium text-slate-400 text-lg">
                          {asset.category_id ? asset.category_id.charAt(0) : 'A'}
                        </div>
                        <div className="ml-4">
                          <Link to={`/assets/${asset.id}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                            {asset.name}
                          </Link>
                          <div className="text-slate-500 font-mono text-xs mt-0.5">{asset.asset_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden md:table-cell">
                      <div className="text-slate-900">{asset.location_id}</div>
                      <div className="text-slate-500 text-xs">{asset.department_id}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium", statusStyles[asset.status])}>
                        {statusLabels[asset.status]}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/assets/${asset.id}`} className="text-indigo-600 hover:text-indigo-900 px-2 py-1 bg-indigo-50 rounded-lg transition-colors">
                          รายละเอียด
                        </Link>
                        <button 
                          onClick={() => handleDelete(asset.id, asset.name)}
                          className="text-rose-600 hover:text-rose-900 p-1 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssetFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddAsset}
        title="เพิ่มครุภัณฑ์ใหม่"
      />

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

