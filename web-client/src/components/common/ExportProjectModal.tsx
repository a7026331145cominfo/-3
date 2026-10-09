import React, { useState } from 'react';
import { Download, Copy, Check, ExternalLink, GitBranch, FolderArchive, ArrowRight } from 'lucide-react';

interface ExportProjectModalProps {
  onClose: () => void;
}

export const ExportProjectModal: React.FC<ExportProjectModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const gitCommands = `# 1. فتح مجلد المشروع بعد فك الضغط في Terminal أو Git Bash
git init
git add .
git commit -m "AlSaqar ERP - GTS 2026 Unified Design"
git branch -M main
git remote add origin https://github.com/a7026331145cominfo/-.git
git push -u origin main`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-2xl max-w-2xl w-full flex flex-col font-sans text-right select-none overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-[#005a9e] to-[#0078d7] text-white px-3.5 py-2.5 flex justify-between items-center text-xs font-semibold border-b border-[#004b85]">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-white" />
            <span>الصقر ERP — تصدير وتحميل كود التصميم لرفعه إلى GitHub</span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-red-600 px-2 py-0.5 text-white font-bold rounded-2xs cursor-pointer transition text-xs"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4 text-xs text-slate-800 bg-[#f8fafc] max-h-[80vh] overflow-y-auto">
          {/* Step 1: Download button */}
          <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-[#005a9e] text-white flex items-center justify-center text-xs font-mono">1</span>
              <span>تحميل كود المشروع والتصميم الحالي (ملف ZIP كامل)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              يحتوي الملف على شاشات الصقر ERP بالكامل، نظام الألوان الموحد، قاعدة البيانات المحلية GTS 2026، وملفات Vite و React و Tailwind.
            </p>
            <div className="pt-1">
              <a
                href="/alsaqar-erp-source.zip"
                download="alsaqar-erp-source.zip"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#005a9e] hover:bg-[#004b85] text-white rounded-xs font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف كود التصميم (alsaqar-erp-source.zip)</span>
              </a>
            </div>
          </div>

          {/* Step 2: Extract */}
          <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-[#005a9e] text-white flex items-center justify-center text-xs font-mono">2</span>
              <span>فك الضغط عن الملف في جهازك</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              بعد تحميل الملف، قم بفك الضغط (Extract / استخراج هنا) داخل المجلد الذي تريده على جهاز الكمبيوتر.
            </p>
          </div>

          {/* Step 3: Push to GitHub */}
          <div className="bg-white border border-[#cbd5e1] rounded-xs p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-[#005a9e] text-white flex items-center justify-center text-xs font-mono">3</span>
                <span>رفع الملفات إلى مستودعك على GitHub</span>
              </div>
              <a
                href="https://github.com/a7026331145cominfo/-"
                target="_blank"
                rel="noreferrer"
                className="text-[#005a9e] hover:underline flex items-center gap-1 font-semibold text-xs"
              >
                <span>فتح المستودع على GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-700 font-semibold text-xs">
                <span>أوامر الرفع عبر Git Terminal / Git Bash:</span>
                <button
                  type="button"
                  onClick={handleCopyCommands}
                  className="px-2.5 py-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#cbd5e1] rounded-xs text-[#005a9e] font-bold cursor-pointer flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ الأوامر'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-3 rounded-xs font-mono text-[11px] leading-relaxed overflow-x-auto text-left dir-ltr">
                {gitCommands}
              </pre>
            </div>

            <div className="p-2.5 bg-[#e5f1fb] border border-[#0078d7]/30 rounded-xs text-xs text-slate-700 space-y-1">
              <div className="font-bold text-[#005a9e]">أو الرفع المباشر بدون أوامر:</div>
              <p className="text-[11px] leading-relaxed">
                افتح رابط المستودع على المتصفح ➔ اضغط <strong>Add file</strong> ➔ اضغط <strong>Upload files</strong> ➔ اسحب الملفات المفكوكة وأفلتها في الصفحة ➔ اضغط <strong>Commit changes</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8fafc] border-t border-[#cbd5e1] px-4 py-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-xs text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
