'use client';

import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle2, Trash2, X } from 'lucide-react';

export interface PopupConfig {
  isOpen: boolean;
  type?: 'alert' | 'confirm' | 'error' | 'success';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

interface CustomPopupProps {
  popup: PopupConfig | null;
  onClose: () => void;
}

export default function CustomPopup({ popup, onClose }: CustomPopupProps) {
  if (!popup || !popup.isOpen) return null;

  const type = popup.type || 'alert';
  const isConfirm = type === 'confirm';
  const isDestructive = popup.destructive ?? isConfirm;

  const handleConfirm = () => {
    if (popup.onConfirm) {
      popup.onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (popup.onCancel) {
      popup.onCancel();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button on top-right */}
          <button
            onClick={handleCancel}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-500 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="flex justify-center mb-4">
            {type === 'error' || isDestructive ? (
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-inner">
                {isDestructive ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
              </div>
            ) : type === 'success' ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight leading-snug">
            {popup.title}
          </h3>

          {/* Description / Message */}
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed px-2">
            {popup.message}
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-center gap-2.5">
            {isConfirm && (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 font-extrabold text-xs sm:text-sm transition"
              >
                {popup.cancelText || 'Cancel'}
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className={`w-full sm:flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-md active:scale-[0.98] transition ${
                isDestructive
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20'
              }`}
            >
              {popup.confirmText || (isConfirm ? 'Confirm' : 'Got it')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

