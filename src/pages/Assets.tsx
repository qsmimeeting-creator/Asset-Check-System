import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { getAssets, createAsset, deleteAsset } from '../lib/api';
import { Asset, AssetStatus } from '../types';
import { Plus, Search, Filter, Trash2, QrCode, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import AssetFormModal from '../components/AssetFormModal';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';

const statusStyles: Record<AssetStatus, string> = {
  active: 'bg-success/10 text-success-hex',
  damaged: 'bg-medical-gray/10 text-medical-gray',
  repair: 'bg-warning/10 text-warning',
  lost: 'bg-inactive/10 text-inactive',
  moved: 'bg-trust-blue/10 text-trust-blue',
  disposed: 'bg-inactive/10 text-inactive',
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  });
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info'}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning'
  });

  const { user } = useAuth();
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

  const handleDelete = (id: string, name: string) => {
    if (user?.role === 'User') {
      setNotification({
        isOpen: true,
        title: 'ไม่อนุญาต',
        message: 'คุณไม่มีสิทธิ์ลบข้อมูลครุภัณฑ์',
        type: 'error'
      });
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'ลบครุภัณฑ์',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบ ${name}? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      type: 'danger',
      onConfirm: async () => {
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
    });
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'รหัสครุภัณฑ์': 'ASSET-001',
        'ชื่อครุภัณฑ์': 'เครื่องคอมพิวเตอร์ Desktop',
        'หมวดหมู่/ประเภท': 'IT Equipment',
        'ยี่ห้อ': 'Dell',
        'รุ่น': 'OptiPlex 7000',
        'ซีเรียลนัมเบอร์': 'SN-12345678',
        'วันที่สั่งซื้อ (YYYY-MM-DD)': '2023-01-15',
        'ราคา': 25000,
        'สถานที่ตั้ง': 'ห้องปฏิบัติการ 1',
        'หน่วยงาน/แผนก': 'ฝ่ายเทคโนโลยีสารสนเทศ',
        'ผู้รับผิดชอบ': 'นายสมชาย ใจดี',
        'วันซ่อมบำรุงครั้งถัดไป (YYYY-MM-DD)': '2024-01-15'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Asset_Import_Template.xlsx');
  };

  const handleImportExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        if (jsonData.length === 0) {
          throw new Error('ไม่พบข้อมูลในไฟล์ Excel');
        }

        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const row of jsonData) {
          try {
            const assetData: Omit<Asset, 'id'> = {
              asset_code: String(row['รหัสครุภัณฑ์'] || ''),
              name: String(row['ชื่อครุภัณฑ์'] || 'ไม่มีชื่อ'),
              category_id: String(row['หมวดหมู่/ประเภท'] || '-'),
              brand: String(row['ยี่ห้อ'] || ''),
              model: String(row['รุ่น'] || ''),
              serial_number: String(row['ซีเรียลนัมเบอร์'] || ''),
              purchase_date: row['วันที่สั่งซื้อ (YYYY-MM-DD)'] ? String(row['วันที่สั่งซื้อ (YYYY-MM-DD)']) : new Date().toISOString().split('T')[0],
              price: Number(row['ราคา']) || 0,
              location_id: String(row['สถานที่ตั้ง'] || '-'),
              department_id: String(row['หน่วยงาน/แผนก'] || '-'),
              responsible_person: String(row['ผู้รับผิดชอบ'] || ''),
              status: 'active',
              next_maintenance_date: String(row['วันซ่อมบำรุงครั้งถัดไป (YYYY-MM-DD)'] || '')
            };
            
            await createAsset(assetData);
            successCount++;
          } catch (err) {
            console.error('Import row failed:', err);
            failCount++;
          }
        }

        setNotification({
          isOpen: true,
          title: 'นำเข้าข้อมูลสำเร็จ',
          message: `นำเข้าข้อมูลสำเร็จ ${successCount} รายการ ${failCount > 0 ? `(ล้มเหลว ${failCount} รายการ)` : ''}`,
          type: failCount > 0 ? 'info' : 'success'
        });
        fetchAssets();
      } catch (err: any) {
        setNotification({
          isOpen: true,
          title: 'ความผิดพลาดในการนำเข้า',
          message: err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์',
          type: 'error'
        });
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.asset_code.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = user?.role !== 'User' || a.department_id === user.department;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">คลังครุภัณฑ์</h1>
          <p className="mt-1 text-sm text-slate-500">จัดการ ติดตาม และอัปเดตข้อมูลครุภัณฑ์ทั้งหมดในระบบ</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 grid grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          {user?.role !== 'User' && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportExcel} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center justify-center rounded-lg bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors w-full lg:w-auto"
              >
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">ดาวน์โหลดตัวอย่าง</span>
                <span className="sm:hidden ml-1">โหลดตัวอย่าง</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-lg bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors w-full lg:w-auto"
              >
                <Upload className="w-4 h-4 mr-1 sm:mr-2" />
                นำเข้า Excel
              </button>
            </>
          )}
          <Link
            to="/scan"
            className="inline-flex items-center justify-center rounded-lg bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors w-full lg:w-auto"
          >
            <QrCode className="w-4 h-4 mr-1 sm:mr-2" />
            สแกน QR
          </Link>
          {user?.role !== 'User' && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-full lg:w-auto"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              เพิ่มครุภัณฑ์
            </button>
          )}
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
            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-shadow"
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
                          <Link to={`/assets/${asset.id}`} className="font-medium text-slate-900 hover:text-primary transition-colors">
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
                        <Link to={`/assets/${asset.id}`} className="text-trust-blue hover:underline px-2 py-1 bg-trust-blue/5 rounded-lg transition-colors">
                          รายละเอียด
                        </Link>
                        {user?.role !== 'User' && (
                          <button 
                            onClick={() => handleDelete(asset.id, asset.name)}
                            className="text-rose-600 hover:text-rose-900 p-1 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
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

