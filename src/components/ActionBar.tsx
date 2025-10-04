import { Copy, Download, CreditCard as Edit3, RotateCw, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ActionBarProps {
  umlCode: string;
  onEdit: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

export function ActionBar({ umlCode, onEdit, onRegenerate, onCopy, onDownload }: ActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        {copied ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Code
          </>
        )}
      </button>

      <button
        onClick={onDownload}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download SVG
      </button>

      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Edit3 className="w-4 h-4" />
        Edit Code
      </button>

      <button
        onClick={onRegenerate}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RotateCw className="w-4 h-4" />
        Regenerate
      </button>
    </div>
  );
}
