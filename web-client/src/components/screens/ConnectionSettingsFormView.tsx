import React, { useState } from 'react';

interface ConnectionSettingsProps {
  onClose: () => void;
}

export const ConnectionSettingsFormView: React.FC<ConnectionSettingsProps> = ({ onClose }) => {
  const [connString, setConnString] = useState(
    'Server=DESKTOP-KBU5DH6;Database=dboGTSdb2026;Trusted_Connection=True;TrustServerCertificate=True;'
  );
  const [status, setStatus] = useState('الاتصال الحالي بقاعدة البيانات: نشط وسليم.');

  const handleSave = () => {
    setStatus('تم حفظ إعداد الاتصال بنجاح.');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTest = () => {
    setStatus('جارٍ اختبار الاتصال... تم الاتصال بقاعدة dboGTSdb2026 بنجاح!');
  };

  return (
    <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-md max-w-2xl mx-auto overflow-hidden text-right">
      <div className="bg-gradient-to-l from-[#005a9e] to-[#0078d7] text-white px-3.5 py-2 flex justify-between items-center text-xs font-semibold border-b border-[#004b85]">
        <div className="flex items-center gap-2">
          <span>⚙️</span>
          <span>الصقر ERP — إعداد الاتصال (ConnectionSettingsForm)</span>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-red-600 px-2 py-0.5 text-white font-bold rounded-2xs cursor-pointer transition text-xs"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-3 text-xs bg-white">
        <div>
          <label className="block text-slate-800 font-bold mb-1">سلسلة الاتصال (Connection String):</label>
          <input
            type="text"
            value={connString}
            onChange={(e) => setConnString(e.target.value)}
            className="w-full border border-[#cbd5e1] bg-white rounded-xs p-2 font-mono text-xs focus:outline-none focus:border-[#0078d7] text-slate-900"
          />
        </div>

        <div className="p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-xs text-[#005a9e] font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>{status}</span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#cbd5e1]">
          <button
            type="button"
            onClick={handleTest}
            className="px-4 py-1.5 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] rounded-xs font-bold text-slate-800 cursor-pointer shadow-2xs transition"
          >
            اختبار الاتصال
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 bg-[#005a9e] hover:bg-[#004b85] text-white rounded-xs font-bold cursor-pointer shadow-2xs transition"
          >
            حفظ الإعداد
          </button>
        </div>
      </div>
    </div>
  );
};
