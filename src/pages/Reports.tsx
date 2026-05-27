import { useState } from 'react';
import { getAssets } from '../lib/api';
import { FileText, Download, AlertCircle, MapPin } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export default function Reports() {
  const [reportType, setReportType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (type: 'all' | 'damaged' | 'location') => {
    setIsGenerating(true);
    setReportType(type);
    try {
      const allAssets = await getAssets();
      let assets = allAssets;
      let title = "รายงานสรุปข้อมูลครุภัณฑ์";

      if (type === 'damaged') {
        assets = allAssets.filter(a => a.status === 'damaged' || a.status === 'repair');
        title = "รายงานครุภัณฑ์ที่ชำรุดและรอซ่อม";
      } else if (type === 'location') {
        assets = [...allAssets].sort((a, b) => a.location_id.localeCompare(b.location_id));
        title = "รายงานครุภัณฑ์จำแนกตามสถานที่ตั้ง";
      }
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(title, 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`วันที่ออกรายงาน: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
      doc.text(`จำนวนรายการในรายงานนี้: ${assets.length} รายการ`, 14, 35);
      
      autoTable(doc, {
        startY: 45,
        headStyles: { fillColor: [79, 70, 229] }, // indigo-600
        head: [['รหัสครุภัณฑ์', 'ชื่อรายการ', 'สถานที่ตั้ง', 'สถานะ']],
        body: assets.map(a => [
          a.asset_code, 
          a.name, 
          a.location_id, 
          a.status.toUpperCase()
        ]),
        styles: { font: 'helvetica' } // Fallback as we don't have Thai font B64'd
      });
      
      doc.save(`${type}_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setReportType(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">ระบบออกรายงาน</h1>
        <p className="mt-1 text-sm text-slate-500">เลือกประเภทรายงานที่ต้องการดาวน์โหลดในรูปแบบ PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Report Card 1 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-xl w-14 h-14 mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">สรุปครุภัณฑ์ทั้งหมด</h2>
          <p className="text-sm text-slate-500 mt-2 flex-grow">
            แสดงรายการครุภัณฑ์ทั้งหมดในระบบ พร้อมสถานที่ตั้งและสถานะปัจจุบัน
          </p>
          <button
            onClick={() => generatePDF('all')}
            disabled={isGenerating}
            className="mt-6 inline-flex items-center justify-center w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating && reportType === 'all' ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
          </button>
        </div>

        {/* Report Card 2 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-center p-4 bg-rose-50 text-rose-600 rounded-xl w-14 h-14 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">ครุภัณฑ์ที่ชำรุด/รอซ่อม</h2>
          <p className="text-sm text-slate-500 mt-2 flex-grow">
            เน้นเฉพาะรายการที่มีสถานะชำรุด หรืออยู่ระหว่างการส่งซ่อม เพื่อวางแผนงบประมาณ
          </p>
          <button
            onClick={() => generatePDF('damaged')}
            disabled={isGenerating}
            className="mt-6 inline-flex items-center justify-center w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating && reportType === 'damaged' ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
          </button>
        </div>

        {/* Report Card 3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-center p-4 bg-emerald-50 text-emerald-600 rounded-xl w-14 h-14 mb-4">
            <MapPin className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">แยกตามสถานที่ตั้ง</h2>
          <p className="text-sm text-slate-500 mt-2 flex-grow">
            จัดกลุ่มครุภัณฑ์ตามห้องหรือแผนก เพื่อความสะดวกในการเดินตรวจสอบพัสดุรายปี
          </p>
          <button
            onClick={() => generatePDF('location')}
            disabled={isGenerating}
            className="mt-6 inline-flex items-center justify-center w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating && reportType === 'location' ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}