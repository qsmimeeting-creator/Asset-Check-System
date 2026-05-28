import { useState, useEffect, useRef } from 'react';
import { getAssets, getDepartments } from '../lib/api';
import { FileText, Download, Printer, Filter, Calendar, Search, ChevronDown, Package, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { Asset, Department } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'ใช้งานปกติ', color: 'bg-success/10 text-success-hex' },
  damaged: { label: 'ชำรุด', color: 'bg-primary/10 text-primary' },
  repair: { label: 'รอซ่อม', color: 'bg-warning/10 text-warning' },
  lost: { label: 'สูญหาย', color: 'bg-inactive/10 text-inactive' },
  disposed: { label: 'จำหน่ายออก', color: 'bg-inactive/10 text-inactive' },
  moved: { label: 'อยู่ระหว่างใช้งาน', color: 'bg-trust-blue/10 text-trust-blue' }
};

export default function Reports() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assets, search, statusFilter, deptFilter, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsData, deptsData] = await Promise.all([
        getAssets(),
        getDepartments()
      ]);
      setAssets(assetsData);
      setDepartments(deptsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...assets];

    if (search) {
      result = result.filter(a => 
        a.name.toLowerCase().includes(search.toLowerCase()) || 
        a.asset_code.toLowerCase().includes(search.toLowerCase()) ||
        a.brand?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }

    if (deptFilter !== 'all') {
      result = result.filter(a => a.department_id === deptFilter);
    }

    if (startDate) {
      result = result.filter(a => new Date(a.purchase_date!) >= new Date(startDate));
    }

    if (endDate) {
      result = result.filter(a => new Date(a.purchase_date!) <= new Date(endDate));
    }

    setFilteredAssets(result);
  };

  const exportToExcel = () => {
    setIsGenerating(true);
    try {
      const data = filteredAssets.map((a, index) => ({
        'ลำดับ': index + 1,
        'รหัสครุภัณฑ์': a.asset_code,
        'ชื่อครุภัณฑ์': a.name,
        'ประเภทครุภัณฑ์': a.category_id,
        'ยี่ห้อ/รุ่น': `${a.brand || '-'} ${a.model || ''}`.trim() || '-',
        'สถานที่ตั้ง': a.location_id,
        'สถานะปัจจุบัน': statusLabels[a.status]?.label || a.status,
        'วันที่ได้มา': a.purchase_date ? format(new Date(a.purchase_date), 'dd/MM/yyyy') : '-'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Assets Report");
      XLSX.writeFile(wb, `Asset_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-12 print:p-0 print:max-w-none">
      {/* Search and Global Actions (Hidden on Print) */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">ระบบออกรายงาน</h1>
          <p className="mt-1 text-sm text-slate-500">ตรวจสอบและออกรายงานข้อมูลครุภัณฑ์</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
              showFilters ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            ตัวกรองข้อมูล
          </button>
          <button
            onClick={exportToExcel}
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            ส่งออก (Excel)
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-all"
          >
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์รายงาน
          </button>
        </div>
      </div>

      {/* Filters Expansion (Hidden on Print) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden print:hidden"
          >
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">ค้นหา</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, รหัส, ยี่ห้อ..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">สถานะ</label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  {Object.entries(statusLabels).map(([val, { label }]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">แผนก</label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">ช่วงวันที่ซื้อ</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Canvas Wrapper */}
      <div className="overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 print:overflow-visible">
        <div 
          id="printable-report"
          ref={reportRef}
          className="bg-white min-h-[1123px] shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none min-w-[1000px] md:min-w-0"
        >
          {/* Report Header */}
          <div className="p-8 border-b-4 border-primary bg-slate-50">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">สรุปครุภัณฑ์ทั้งหมด</h1>
              <p className="text-slate-500 font-medium tracking-wide">
                แสดงรายการครุภัณฑ์ทั้งหมดในระบบ พร้อมสถานที่ตั้งและสถานะปัจจุบัน
              </p>
            </div>
  
            <div className="flex justify-start">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl px-8 py-4 flex items-center gap-6 shadow-sm">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">จำนวนครุภัณฑ์ทั้งหมด</p>
                  <p className="text-3xl font-bold text-primary">
                    {filteredAssets.length} <span className="text-base text-primary/70 ml-1">รายการ</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Report Table */}
          <div className="p-0 overflow-x-auto">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider text-center border-b border-slate-200">
                  <th className="py-4 px-4 border-x border-slate-200 w-[60px]">ลำดับ</th>
                  <th className="py-4 px-4 border-x border-slate-200 w-[140px]">รหัสครุภัณฑ์</th>
                  <th className="py-4 px-4 border-x border-slate-200">ชื่อครุภัณฑ์</th>
                  <th className="py-4 px-4 border-x border-slate-200">ประเภทครุภัณฑ์</th>
                  <th className="py-4 px-4 border-x border-slate-200">ยี่ห้อ/รุ่น</th>
                  <th className="py-4 px-4 border-x border-slate-200">สถานที่ตั้ง</th>
                  <th className="py-4 px-4 border-x border-slate-200 w-[140px]">สถานะปัจจุบัน</th>
                  <th className="py-4 px-4 border-x border-slate-200 w-[120px]">วันที่ได้มา</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset, index) => (
                    <tr key={asset.id} className="text-sm hover:bg-slate-50 transition-colors odd:bg-slate-50/50">
                      <td className="py-3 px-4 border border-slate-200 text-center font-medium">{index + 1}</td>
                      <td className="py-3 px-4 border border-slate-200 text-center font-mono font-semibold">{asset.asset_code}</td>
                      <td className="py-3 px-4 border border-slate-200 font-medium">{asset.name}</td>
                      <td className="py-3 px-4 border border-slate-200 text-center">{asset.category_id}</td>
                      <td className="py-3 px-4 border border-slate-200 text-center">{asset.brand} {asset.model}</td>
                      <td className="py-3 px-4 border border-slate-200 text-center">{asset.location_id}</td>
                      <td className="py-3 px-4 border border-slate-200 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg border text-[11px] font-bold ${statusLabels[asset.status]?.color || 'bg-slate-100'}`}>
                          {statusLabels[asset.status]?.label || asset.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border border-slate-200 text-center font-medium">
                        {asset.purchase_date ? format(new Date(asset.purchase_date), 'dd/MM/yyyy') : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-slate-400 font-medium bg-white">
                      ไม่พบข้อมูลที่ตรงตามเงื่อนไข
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
  
          {/* Report Footer */}
          <div className="p-8 mt-auto">
            <div className="flex justify-between items-end border-t-2 border-slate-100 pt-8">
              <div className="text-slate-600 text-sm font-semibold">
                รวมทั้งสิ้น {filteredAssets.length} รายการ
              </div>
              <div className="text-right space-y-4">
                {/* Footer metadata removed per request */}
              </div>
            </div>
          </div>
        </div>
      </div>


      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-hidden {
            display: none !important;
          }
          .max-w-[1200px] {
             max-width: none !important;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
