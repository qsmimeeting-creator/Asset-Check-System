import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function NotificationModal({ isOpen, onClose, title, message, type = 'info' }: NotificationModalProps) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="w-12 h-12 text-emerald-500" />,
    error: <AlertCircle className="w-12 h-12 text-rose-500" />,
    info: <Info className="w-12 h-12 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-50',
    error: 'bg-rose-50',
    info: 'bg-blue-50',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
        <div className={cn("p-8 flex flex-col items-center text-center", bgColors[type])}>
          {icons[type]}
          <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-slate-600 leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className="mt-8 w-full py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
}
