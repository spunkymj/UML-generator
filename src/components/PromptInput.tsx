import { useState } from 'react';
import { Wand2, AlertCircle } from 'lucide-react';
import type { UMLType } from '../types/uml';

interface PromptInputProps {
  onGenerate: (prompt: string, umlType: UMLType) => void;
  isGenerating?: boolean;
}

export function PromptInput({ onGenerate, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [umlType, setUmlType] = useState<UMLType>('flowchart');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, umlType);
    }
  };

  const examples = [
    { text: 'User login process with authentication', type: 'flowchart' as UMLType },
    { text: 'User, API, Database interaction flow', type: 'sequence' as UMLType },
    { text: 'User, Order, Product entities with relationships', type: 'er' as UMLType },
    { text: 'Vehicle, Car, Truck inheritance hierarchy', type: 'class' as UMLType },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Diagram Type
          </label>
          <select
            value={umlType}
            onChange={(e) => setUmlType(e.target.value as UMLType)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence Diagram</option>
            <option value="class">Class Diagram</option>
            <option value="er">Entity Relationship</option>
            <option value="state">State Diagram</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Describe your diagram
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., User login process with email verification and error handling"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            disabled={isGenerating}
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Wand2 className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Generate UML'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-start gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-600">
            Try these examples:
          </p>
        </div>
        <div className="space-y-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(example.text);
                setUmlType(example.type);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
            >
              {example.text} <span className="text-slate-500">({example.type})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
