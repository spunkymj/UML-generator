import { useState } from 'react';
import { CreditCard as Edit3, X, Check } from 'lucide-react';

interface UMLEditorProps {
  initialCode: string;
  onSave: (newCode: string) => void;
  onCancel: () => void;
}

export function UMLEditor({ initialCode, onSave, onCancel }: UMLEditorProps) {
  const [code, setCode] = useState(initialCode);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Edit UML Code</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={() => onSave(code)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 w-full p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Enter Mermaid syntax..."
        spellCheck={false}
      />
    </div>
  );
}
