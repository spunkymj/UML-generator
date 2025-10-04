import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface UMLRendererProps {
  code: string;
  onRenderError?: (error: string) => void;
}

export function UMLRenderer({ code, onRenderError }: UMLRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !code) return;

      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        containerRef.current.innerHTML = svg;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
        setError(errorMessage);
        onRenderError?.(errorMessage);
        containerRef.current.innerHTML = `
          <div class="text-red-600 p-4 bg-red-50 rounded-lg">
            <p class="font-semibold">Rendering Error:</p>
            <p class="text-sm mt-1">${errorMessage}</p>
          </div>
        `;
      }
    };

    renderDiagram();
  }, [code, onRenderError]);

  return (
    <div className="w-full h-full overflow-auto bg-white rounded-lg border border-slate-200">
      <div ref={containerRef} className="p-6 flex items-center justify-center min-h-[400px]" />
    </div>
  );
}
