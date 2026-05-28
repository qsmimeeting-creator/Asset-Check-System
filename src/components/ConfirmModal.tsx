import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'warning'
}: ConfirmModalProps) {
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
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                  type === 'danger' ? "bg-primary/10 text-primary" : 
                  type === 'warning' ? "bg-warning/10 text-warning" : 
                  "bg-trust-blue/10 text-trust-blue"
                )}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{message}</p>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 px-4 py-2.5 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95",
                    type === 'danger' ? "bg-primary hover:bg-primary-hover" :
                    type === 'warning' ? "bg-warning hover:opacity-90" :
                    "bg-trust-blue hover:opacity-90"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
