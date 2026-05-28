import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getAssetByCode, addInspection } from '../lib/api';
import { Asset, AssetStatus } from '../types';
import { QrCode, AlertCircle, Camera, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';

type FormData = {
  status: AssetStatus;
  note: string;
  location_id: string;
};

export default function ScanQR() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const prefillCode = searchParams.get('code');

  const { register, handleSubmit, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefillCode) {
      handleScan(prefillCode);
      return;
    }

    let isMounted = true;

    const initScanner = async () => {
      // Ensure we clean up any pre-existing content in the div before starting
      const readerElement = document.getElementById("reader");
      if (readerElement) {
        readerElement.innerHTML = "";
      }

      if (!scannerRef.current && isMounted) {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        
        scanner.render(
          (text) => {
            if (isMounted) handleScan(text);
          }, 
          (err) => {
            // Ignored, happens constantly while scanning
          }
        );
        
        scannerRef.current = scanner;
      }
    };

    // Small delay to ensure DOM is ready and any previous cleanup finished
    const timer = setTimeout(initScanner, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.error("Failed to clear scanner:", err);
        });
        scannerRef.current = null;
      }
    };
  }, [prefillCode]);

  const handleScan = async (decodedText: string) => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to clear scanner on scan:", err);
      }
      scannerRef.current = null;
    }
    setScanResult(decodedText);
    setError('');

    try {
      const foundAsset = await getAssetByCode(decodedText);
      if (foundAsset) {
        setAsset(foundAsset);
        reset({
          status: foundAsset.status,
          location_id: foundAsset.location_id,
          note: ''
        });
      } else {
        setError(`ไม่พบครุภัณฑ์ที่ตรงกับรหัส: ${decodedText}`);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลครุภัณฑ์');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!asset) return;
    setIsSubmitting(true);
    try {
      await addInspection({
        asset_id: asset.id,
        checked_by: "ผู้ดูแลระบบ", // In real app, from auth state
        checked_at: new Date().toISOString(),
        status: data.status,
        location_id: data.location_id,
        note: data.note
      });
      navigate(`/assets/${asset.id}`);
    } catch (e: any) {
      setError(e.message);
      setIsSubmitting(false);
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setAsset(null);
    setError('');
    
    // Small delay to ensure the "reader" div is back in the DOM
    setTimeout(() => {
      const readerElement = document.getElementById("reader");
      if (readerElement) {
        readerElement.innerHTML = "";
      }

      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render((text) => handleScan(text), () => {});
      scannerRef.current = scanner;
    }, 100);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight flex items-center justify-center">
          <QrCode className="w-8 h-8 mr-3 text-indigo-600" />
          สแกน QR Code ครุภัณฑ์
        </h1>
        <p className="mt-2 text-slate-500">จ่อกล้องไปที่ QR Code ของครุภัณฑ์เพื่อเริ่มการตรวจสอบ</p>
      </div>

      {!scanResult && !prefillCode && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div id="reader" className="w-full"></div>
        </div>
      )}

      {error && (
        <div className="mt-6 border-l-4 border-rose-500 bg-rose-50 p-4 rounded-r-xl">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <div className="ml-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
          <button onClick={handleRescan} className="mt-4 text-sm font-medium text-rose-600 hover:text-rose-500">
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}

      {asset && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">แบบฟอร์มการตรวจสอบ</h2>
            <p className="text-sm text-slate-500">ครุภัณฑ์: {asset.asset_code} - {asset.name}</p>
          </div>
          <form className="p-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">สถานะปัจจุบัน</label>
              <select
                {...register("status")}
                className="mt-2 block w-full rounded-xl border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="active">ปกติ / พร้อมใช้งาน</option>
                <option value="damaged">ชำรุด</option>
                <option value="repair">ส่งซ่อม</option>
                <option value="lost">สูญหาย</option>
                <option value="moved">ย้ายสถานที่</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">สถานที่ตั้งปัจจุบัน (ตรวจสอบความถูกต้อง)</label>
              <input
                type="text"
                {...register("location_id")}
                className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">หมายเหตุ / รายละเอียดการตรวจ</label>
              <textarea
                rows={4}
                {...register("note")}
                className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="ระบุรายละเอียดเพิ่มเติมที่นี่..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRescan}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลการตรวจ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
