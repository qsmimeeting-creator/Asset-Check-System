import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAssetById, getInspections, updateAsset, deleteAsset } from '../lib/api';
import { Asset, Inspection, AssetStatus } from '../types';
import { ArrowLeft, Box, MapPin, User, Calendar, DollarSign, Activity, Printer, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
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

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  const fetchData = () => {
    if (id) {
      setLoading(true);
      Promise.all([
        getAssetById(id),
        getInspections(id)
      ]).then(([assetData, inspectionsData]) => {
        setAsset(assetData);
        setInspections(inspectionsData);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="animate-pulse space-y-4">กำลังโหลดข้อมูล...</div>;
  }

  if (!asset) {
    return <div className="text-center py-12 text-slate-500">ไม่พบข้อมูลครุภัณฑ์</div>;
  }

  const handleEditAsset = async (data: any) => {
    try {
      await updateAsset(asset.id, data);
      setIsEditModalOpen(false);
      setNotification({
        isOpen: true,
        title: 'สำเร็จ',
        message: 'อัปเดตข้อมูลครุภัณฑ์เรียบร้อยแล้ว',
        type: 'success'
      });
      fetchData();
    } catch (e) {
      setNotification({
        isOpen: true,
        title: 'ความผิดพลาด',
        message: 'ไม่สามารถบันทึกข้อมูลได้',
        type: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${asset.name}?`)) {
      try {
        await deleteAsset(asset.id);
        navigate('/assets');
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

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 mb-4">
        <Link to="/assets" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">{asset.name}</h1>
          <p className="font-mono text-sm text-slate-500">{asset.asset_code}</p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            title="แก้ไข"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
            title="ลบ"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", statusStyles[asset.status])}>
            {statusLabels[asset.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">ข้อมูลพื้นฐานครุภัณฑ์</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-slate-500 flex items-center"><Box className="w-4 h-4 mr-2" /> ยี่ห้อ / รุ่น</dt>
                  <dd className="mt-1 text-sm text-slate-900">{asset.brand} - {asset.model}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">หมายเลขซีเรียล (S/N)</dt>
                  <dd className="mt-1 text-sm text-slate-900 font-mono bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">{asset.serial_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 flex items-center"><MapPin className="w-4 h-4 mr-2" /> สถานที่ตั้ง</dt>
                  <dd className="mt-1 text-sm text-slate-900">{asset.location_id}</dd>
                  <dd className="text-xs text-slate-500">{asset.department_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 flex items-center"><User className="w-4 h-4 mr-2" /> ผู้รับผิดชอบ</dt>
                  <dd className="mt-1 text-sm text-slate-900">{asset.responsible_person}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 flex items-center"><Calendar className="w-4 h-4 mr-2" /> วันที่ได้มา</dt>
                  <dd className="mt-1 text-sm text-slate-900">{asset.purchase_date}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 flex items-center"><DollarSign className="w-4 h-4 mr-2" /> ราคา</dt>
                  <dd className="mt-1 text-sm text-slate-900">{formatCurrency(asset.price)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Inspection History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Activity className="w-5 h-5 rounded mr-2 text-indigo-500" />
                ประวัติการตรวจสอบ
              </h2>
              <Link 
                to={`/scan?code=${asset.asset_code}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                + ตรวจสอบใหม่
              </Link>
            </div>
            <div className="p-0">
              {inspections.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">ยังไม่มีประวัติการตรวจสอบในระบบ</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {inspections.map((insp) => (
                    <li key={insp.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between space-x-3">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{insp.note || "การตรวจสอบปกติ"}</div>
                          <div className="text-sm text-slate-500 mt-1 flex items-center">
                            <span>โดย {insp.checked_by}</span>
                            <span className="mx-2">•</span>
                            <span>{insp.checked_at}</span>
                          </div>
                        </div>
                        <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", statusStyles[insp.status])}>
                          {statusLabels[insp.status]}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar QR Code */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center print:shadow-none print:border-none print:p-0">
            <h3 className="text-sm font-medium text-slate-500 mb-4 print:hidden">QR Code ประจำครุภัณฑ์</h3>
            <div className="inline-block p-4 bg-white border border-slate-200 rounded-xl mb-4 print:border-8 print:border-black">
              <QRCodeSVG 
                value={asset.asset_code}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="font-mono text-sm font-medium">{asset.asset_code}</p>
            <p className="text-xs text-slate-500 mt-1">{asset.name}</p>
            
            <button 
              onClick={handlePrintQR}
              className="mt-6 flex items-center justify-center w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 print:hidden"
            >
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์สติ๊กเกอร์
            </button>
          </div>
        </div>
      </div>

      <AssetFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditAsset}
        initialData={asset}
        title="แก้ไขข้อมูลครุภัณฑ์"
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
