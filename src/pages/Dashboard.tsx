import { useEffect, useState } from 'react';
import { getDashboardStats } from '../lib/api';
import { DashboardStats } from '../types';
import { Package, AlertCircle, Wrench, CheckCircle, PieChart as PieChartIcon } from 'lucide-react';
import { cn, formatThaiDate } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  active: '#198754', // success
  damaged: '#6C757D', // medical-gray
  repair: '#FFC107', // warning
  lost: '#ADB5BD', // inactive
  disposed: '#DEE2E6' // medical-border
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const deptId = user?.role === 'User' ? user.department : undefined;
    getDashboardStats(deptId).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [user]);

  if (loading || !stats) {
    return <div className="animate-pulse flex space-x-4">กำลังโหลดข้อมูลภาพรวม...</div>;
  }

  const pieData = [
    { name: 'ปกติ', value: stats.active, color: COLORS.active },
    { name: 'ชำรุด', value: stats.damaged, color: COLORS.damaged },
    { name: 'รอซ่อม', value: stats.repair, color: COLORS.repair },
    { name: 'สูญหาย', value: stats.lost, color: COLORS.lost },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">ภาพรวมระบบ</h1>
        <p className="text-sm text-slate-500">สถานะครุภัณฑ์แบบเรียลไทม์</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="ครุภัณฑ์ทั้งหมด" value={stats.total} icon={Package} color="bg-primary/10 text-primary" />
        <StatCard title="สถานะปกติ" value={stats.active} icon={CheckCircle} color="bg-success/10 text-[#198754]" />
        <StatCard title="ต้องการการซ่อมแซม" value={stats.repair + stats.damaged} icon={Wrench} color="bg-warning/10 text-warning" />
        <StatCard title="สูญหาย / ไม่พบ" value={stats.lost} icon={AlertCircle} color="bg-inactive/10 text-inactive" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">สัดส่วนสถานะครุภัณฑ์</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center text-sm">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}</span>
                <span className="text-slate-400 ml-1">({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Maintenance List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">กำหนดซ่อมบำรุงที่กำลังจะถึง</h2>
            </div>
            <a href="/assets" className="text-sm font-medium text-trust-blue hover:underline">ดูทั้งหมด</a>
          </div>
          <div className="space-y-4">
            {stats.upcomingMaintenance.length > 0 ? (
              stats.upcomingMaintenance.map((item) => {
                const mDate = new Date(item.next_maintenance_date);
                const diffDays = Math.ceil((mDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/5 rounded-lg p-2.5">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">รหัส: {item.asset_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{formatThaiDate(item.next_maintenance_date)}</p>
                      <p className={cn(
                        "text-xs font-medium mt-0.5",
                        diffDays <= 7 ? "text-primary" : "text-warning"
                      )}>
                        ใน {diffDays} วัน
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <CheckCircle className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">ไม่มีกำหนดการซ่อมบำรุงใน 30 วันข้างหน้า</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
