import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('ยังไม่ได้เชื่อมต่อ Supabase');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. ตรวจสอบว่ามีอีเมลนี้ในระบบหรือไม่
      const { data: userExists, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!userExists) {
        setError('ไม่พบอีเมลนี้ในระบบงานครุภัณฑ์');
        setLoading(false);
        return;
      }

      // 2. หากพบ จึงส่งคำสั่ง reset ไปยัง Supabase Auth
      const { error } = await supabase!.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <div className="mb-6">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">ลืมรหัสผ่าน?</h1>
            <p className="text-slate-500 mt-2">กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
          </div>

          {!success ? (
            <form onSubmit={handleResetRequest} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                  อีเมล
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    กำลังส่งคำขอ...
                  </>
                ) : (
                  'ส่งลิงก์รีเซ็ตรหัสผ่าน'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 animate-in zoom-in-95">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">ตรวจสอบอีเมลของคุณ</h2>
              <p className="text-slate-500 mb-8">
                เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่ <span className="font-bold text-slate-900">{email}</span> แล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
