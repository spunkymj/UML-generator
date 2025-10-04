import { useState } from 'react';
import { Network, BarChart3 } from 'lucide-react';
import { PromptInput } from './components/PromptInput';
import { UMLRenderer } from './components/UMLRenderer';
import { UMLEditor } from './components/UMLEditor';
import { FeedbackPanel } from './components/FeedbackPanel';
import { ActionBar } from './components/ActionBar';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { UMLGenerator } from './services/umlGenerator';
import { storageService } from './services/storage';
import type { UMLType, UMLGeneration, UMLFeedback, UMLInteraction } from './types/uml';

function App() {
  const [currentGeneration, setCurrentGeneration] = useState<UMLGeneration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'generator' | 'analytics'>('generator');
  const [startTime, setStartTime] = useState<number>(Date.now());

  const trackInteraction = (actionType: UMLInteraction['actionType'], metadata?: Record<string, any>) => {
    if (!currentGeneration) return;

    const interaction: UMLInteraction = {
      id: crypto.randomUUID(),
      generationId: currentGeneration.id,
      actionType,
      timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
      metadata,
      createdAt: new Date()
    };

    storageService.saveInteraction(interaction);
  };

  const handleGenerate = (prompt: string, umlType: UMLType) => {
    setIsGenerating(true);
    setStartTime(Date.now());

    setTimeout(() => {
      const generatedCode = UMLGenerator.generateFromPrompt(prompt, umlType);
      const validation = UMLGenerator.validateMermaidSyntax(generatedCode);

      const generation: UMLGeneration = {
        id: crypto.randomUUID(),
        prompt,
        generatedUml: generatedCode,
        umlType,
        syntaxValid: validation.valid,
        validationErrors: validation.errors,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      storageService.saveGeneration(generation);
      setCurrentGeneration(generation);
      setIsGenerating(false);
      setIsEditing(false);

      trackInteraction('view');
    }, 500);
  };

  const handleEdit = () => {
    setIsEditing(true);
    trackInteraction('edit_start');
  };

  const handleSaveEdit = (newCode: string) => {
    if (!currentGeneration) return;

    const validation = UMLGenerator.validateMermaidSyntax(newCode);
    const updatedGeneration = {
      ...currentGeneration,
      generatedUml: newCode,
      syntaxValid: validation.valid,
      validationErrors: validation.errors,
      updatedAt: new Date()
    };

    setCurrentGeneration(updatedGeneration);
    setIsEditing(false);
    trackInteraction('edit_save', { wasValid: validation.valid });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    trackInteraction('edit_cancel');
  };

  const handleFeedback = (feedbackData: {
    rating?: number;
    feedbackText?: string;
    feedbackType: 'positive' | 'negative' | 'neutral';
  }) => {
    if (!currentGeneration) return;

    const feedback: UMLFeedback = {
      id: crypto.randomUUID(),
      generationId: currentGeneration.id,
      ...feedbackData,
      wasEdited: currentGeneration.createdAt.getTime() !== currentGeneration.updatedAt.getTime(),
      createdAt: new Date()
    };

    storageService.saveFeedback(feedback);
  };

  const handleCopy = () => {
    if (!currentGeneration) return;
    navigator.clipboard.writeText(currentGeneration.generatedUml);
    trackInteraction('copy');
  };

  const handleDownload = () => {
    if (!currentGeneration) return;

    const svgElement = document.querySelector('#root svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uml-diagram-${currentGeneration.id}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }

    trackInteraction('download');
  };

  const handleRegenerate = () => {
    if (!currentGeneration) return;
    trackInteraction('regenerate');
    handleGenerate(currentGeneration.prompt, currentGeneration.umlType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">UML Generator</h1>
                <p className="text-sm text-slate-600">AI-powered diagram generation with feedback collection</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('generator')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'generator'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Generator
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  view === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {view === 'analytics' ? (
          <AnalyticsDashboard />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />

              {currentGeneration && !isEditing && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-800 mb-2">Generated Code</h3>
                    <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-x-auto">
                      {currentGeneration.generatedUml}
                    </pre>
                    {!currentGeneration.syntaxValid && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <strong>Validation warnings:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {currentGeneration.validationErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <ActionBar
                    umlCode={currentGeneration.generatedUml}
                    onEdit={handleEdit}
                    onRegenerate={handleRegenerate}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                  />

                  <FeedbackPanel onSubmit={handleFeedback} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              {currentGeneration && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800 mb-4">
                    {isEditing ? 'Edit Mode' : 'Preview'}
                  </h3>
                  {isEditing ? (
                    <UMLEditor
                      initialCode={currentGeneration.generatedUml}
                      onSave={handleSaveEdit}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <UMLRenderer code={currentGeneration.generatedUml} />
                  )}
                </div>
              )}

              {!currentGeneration && (
                <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                  <Network className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No diagram yet</h3>
                  <p className="text-slate-600">
                    Enter a prompt on the left to generate your first UML diagram
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
