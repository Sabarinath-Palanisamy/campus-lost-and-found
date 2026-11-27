import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // Options: "danger" (red button) | "primary" (blue button)
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  const buttonStyle = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
        
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3">
          {variant === 'danger' && (
            <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-600 mb-6">{message}</p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition shadow-sm ${buttonStyle}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}