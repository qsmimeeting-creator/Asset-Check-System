import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function NotificationModal({ isOpen, onClose, title, message, type = 'info' }: NotificationModalProps) {
  const icons = {
    success: <CheckCircle className="w-12 h-12 text-[#198754]" />,
    error: <AlertCircle className="w-12 h-12 text-primary" />,
    info: <Info className="w-12 h-12 text-trust-blue" />,
  };

  const bgColors = {
    success: 'bg-success/10',
    error: 'bg-primary/5',
    info: 'bg-trust-blue/5',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className={cn("p-8 flex flex-col items-center text-center", bgColors[type])}>
              <div className="mb-4">
                {icons[type]}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-slate-600 leading-relaxed">{message}</p>
              <button
                onClick={onClose}
                className="mt-8 w-full py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transition-all"
              >
                ตกลง
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
