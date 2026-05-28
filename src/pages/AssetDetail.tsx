import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAssetById, getInspections, updateAsset, deleteAsset } from '../lib/api';
import { Asset, Inspection, AssetStatus } from '../types';
import { ArrowLeft, Box, MapPin, User, Calendar, DollarSign, Activity, Printer, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, cn, formatThaiDateTime, formatThaiDate } from '../lib/utils';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import AssetFormModal from '../components/AssetFormModal';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';
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
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info'}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning'
  });

  const { user } = useAuth();
  const fetchData = () => {
    if (id) {
      setLoading(true);
      Promise.all([
        getAssetById(id),
        getInspections(id)
      ]).then(([assetData, inspectionsData]) => {
        if (assetData) {
          // Access control: User role can only see assets from their department
          if (user?.role === 'User' && assetData.department_id !== user.department) {
            setNotification({
              isOpen: true,
              title: 'เข้าถึงไม่ได้',
              message: 'คุณไม่มีสิทธิ์ดูข้อมูลครุภัณฑ์ของแผนกอื่น',
              type: 'error'
            });
            setTimeout(() => {
              navigate('/assets');
            }, 2000);
            setLoading(false);
            return;
          }
        }
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

  const handleDelete = () => {
    if (!asset) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'ลบครุภัณฑ์',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบ ${asset.name}? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      type: 'danger',
      onConfirm: async () => {
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
    });
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Printable Area (Hidden on screen) */}
      <div id="printable-sticker" className="hidden print:block print:bg-white print:p-0 print:m-0">
        <div className="flex flex-col items-center justify-center min-h-[4cm] p-4 text-center">
          <h3 className="text-[12px] font-bold text-slate-700 mb-4 font-sans uppercase tracking-wider">QR Code ประจำครุภัณฑ์</h3>
          <div className="border border-slate-200 rounded-xl p-3 bg-white mb-4">
            <QRCodeSVG 
              value={`${window.location.origin}/assets/${asset.id}`}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="font-mono text-[14px] font-bold text-slate-900">{asset.asset_code}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight max-w-[180px]">{asset.name}</p>
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-sticker, #printable-sticker * {
              visibility: visible;
            }
            #printable-sticker {
              position: absolute;
              left: 50%;
              top: 0;
              transform: translateX(-50%);
              width: 5cm;
              height: auto;
            }
            @page {
              size: auto;
              margin: 0;
            }
            header, nav, aside, footer, button {
              display: none !important;
            }
          }
        `}</style>
      </div>

      <div className="flex items-center space-x-4 mb-4 print:hidden">
        <Link to="/assets" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">{asset.name}</h1>
          <p className="font-mono text-sm text-slate-500">{asset.asset_code}</p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center space-x-2">
          {user?.role !== 'User' && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 text-trust-blue bg-trust-blue/5 rounded-lg hover:bg-trust-blue/10 transition-colors"
                title="แก้ไข"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                title="ลบ"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
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
                  <dd className="mt-1 text-sm text-slate-900">{formatThaiDate(asset.purchase_date)}</dd>
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
                <Activity className="w-5 h-5 rounded mr-2 text-primary" />
                ประวัติการตรวจสอบ
              </h2>
              <Link 
                to={`/scan?code=${asset.asset_code}`}
                className="text-sm font-medium text-trust-blue hover:underline"
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
                          <div className="text-sm font-medium text-slate-900">{insp.note || `ตรวจสอบแล้วพบว่า${statusLabels[insp.status]}`}</div>
                          <div className="text-sm text-slate-500 mt-1 flex items-center">
                            <span>โดย {insp.checked_by}</span>
                            <span className="mx-2">•</span>
                            <span>{formatThaiDateTime(insp.checked_at)}</span>
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
                value={`${window.location.origin}/assets/${asset.id}`}
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
