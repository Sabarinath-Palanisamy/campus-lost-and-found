import React from 'react';

export default function ContactModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
        <h3 className="text-lg font-bold mb-1">Contact Reporter</h3>
        <p className="text-xs text-slate-500 mb-4">
          Reference Key: <span className="font-mono text-slate-700 font-bold">{item.searchkey}</span>
        </p>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded text-left space-y-1 mb-4 text-xs">
          <div><span className="font-semibold text-slate-500">Name:</span> {item.user?.fullName || 'N/A'}</div>
          <div><span className="font-semibold text-slate-500">Email:</span> {item.user?.email || 'N/A'}</div>
          <div><span className="font-semibold text-slate-500">Phone:</span> {item.user?.phoneNumber || 'N/A'}</div>
        </div>
        <button onClick={onClose} className="w-full py-2 bg-slate-800 text-white rounded text-sm font-semibold transition hover:bg-slate-900">
          Close
        </button>
      </div>
    </div>
  );
}