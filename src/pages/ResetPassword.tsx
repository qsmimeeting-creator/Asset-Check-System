import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session (user clicked the reset link)
    const checkSession = async () => {
      if (!supabase) return;
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ กรุณาลองใหม่อีกครั้ง');
        return;
      }

      // If we are at /reset-password but no session is detected,
      // and we have a hash in the URL, Supabase might be still processing it.
      if (!session && !window.location.hash) {
        setError('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ');
      }
    };
    
    checkSession();

    // Also listen for auth changes to catch the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        console.log('Auth event in ResetPassword:', event);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (!supabase) {
      setError('ยังไม่ได้เชื่อมต่อ Supabase');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Update Supabase Auth password
      const { data: { user }, error: authError } = await supabase!.auth.updateUser({
        password: password,
      });

      if (authError) throw authError;

      // 2. Sync with custom users table
      if (user?.email) {
        console.log('Syncing password for user:', user.email);
        
        // Use a more robust update - try matching email case-insensitively just in case
        const { data: syncData, error: dbError, count } = await supabase!
          .from('users')
          .update({ 
            password: password,
            // Optionally update password_updated_at if it exists
          })
          .eq('email', user.email)
          .select();
        
        if (dbError) {
          console.error('Database sync error details:', dbError);
          throw new Error(`บันทึกรหัสผ่านลงฐานข้อมูลไม่สำเร็จ: ${dbError.message}`);
        }

        if (!syncData || syncData.length === 0) {
          console.warn('No user found in users table for email:', user.email);
          // If no row was updated, it means the user doesn't exist in our custom table with this email
          throw new Error('ไม่พบข้อมูลผู้ใช้งานในระบบ เพื่อความปลอดภัยกรุณาติดต่อผู้ดูแลระบบ');
        }
        
        console.log('Successfully synced password to users table');
      }

      setSuccess(true);
      
      // Auto logout and redirect after success
      setTimeout(() => {
        supabase!.auth.signOut();
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-slate-500 mt-2">กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
          </div>

          {!success ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                    placeholder="••••••••"
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
                    กำลังบันทึก...
                  </>
                ) : (
                  'บันทึกรหัสผ่านใหม่'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 animate-in zoom-in-95">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">รีเซ็ตรหัสผ่านสำเร็จ!</h2>
              <p className="text-slate-500 mb-4">
                รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว ระบบกำลังพาท่านกลับไปหน้าเข้าสู่ระบบ...
              </p>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-progress"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
