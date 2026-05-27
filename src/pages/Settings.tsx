import { useState } from 'react';
import { Settings as SettingsIcon, Building, Shield, Bell, Database, Globe, Save } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

export default function Settings() {
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });

  const [settings, setSettings] = useState({
    orgName: 'โรงพยาบาลพญาทีเป',
    orgAddress: '123 ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330',
    contactEmail: 'it@hospital.com',
    language: 'th',
    notifications: true,
    autoBackup: false
  });

  const handleSave = () => {
    setNotification({
      isOpen: true,
      title: 'บันทึกสำเร็จ',
      message: 'การตั้งค่าระบบถูกบันทึกเรียบร้อยแล้ว',
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
            <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl">
              <Building className="w-5 h-5 mr-3" />
              ข้อมูลหน่วยงาน
            </button>
            <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <Shield className="w-5 h-5 mr-3" />
              ความปลอดภัย & สิทธิ์
            </button>
            <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5 mr-3" />
              การแจ้งเตือน
            </button>
            <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <Database className="w-5 h-5 mr-3" />
              สำรองข้อมูล
            </button>
            <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <Globe className="w-5 h-5 mr-3" />
              ภาษาและภูมิภาค
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลหน่วยงาน</h2>
              <p className="text-sm text-slate-500">ส่วนนี้จะแสดงในหัวข้อรายงานและหน้าโปรไฟล์</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">ชื่อหน่วยงาน / องค์กร</label>
                <input
                  type="text"
                  value={settings.orgName}
                  onChange={(e) => setSettings({...settings, orgName: e.target.value})}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">ที่อยู่หน่วยงาน</label>
                <textarea
                  rows={3}
                  value={settings.orgAddress}
                  onChange={(e) => setSettings({...settings, orgAddress: e.target.value})}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">อีเมลติดต่อกลาง</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">การตั้งค่าระบบ</h2>
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

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
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
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
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
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4 mr-2" />
              บันทึกการเปลี่ยนแปลงทั้งหมด
            </button>
          </div>
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
