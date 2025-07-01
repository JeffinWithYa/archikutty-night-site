import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
    code: string;
    description: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, description }) => {
    const diagramRef = useRef<HTMLDivElement>(null);
    const diagramId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            wrap: true,
            flowchart: {
                nodeSpacing: 50,
                rankSpacing: 50,
                curve: 'basis'
            }
        });

        const renderDiagram = async () => {
            if (diagramRef.current) {
                try {
                    // Clear previous diagram
                    diagramRef.current.innerHTML = '';

                    // Render new diagram
                    const { svg } = await mermaid.render(diagramId.current, code);
                    diagramRef.current.innerHTML = svg;
                } catch (error) {
                    console.error('Mermaid rendering error:', error);
                    diagramRef.current.innerHTML = `
            <div class="text-red-600 p-4 border border-red-300 rounded bg-red-50">
              <p class="font-semibold">Diagram Error</p>
              <p class="text-sm">Unable to render family tree diagram</p>
            </div>
          `;
                }
            }
        };

        renderDiagram();
    }, [code]);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 my-3 shadow-sm">
            <div className="mb-3">
                <h4 className="text-sm font-semibold text-purple-700 mb-1">🌳 Family Tree Diagram</h4>
                <p className="text-xs text-gray-600">{description}</p>
            </div>
            <div
                ref={diagramRef}
                className="mermaid-diagram overflow-x-auto bg-gray-50 p-3 rounded border"
                style={{ minHeight: '200px' }}
            />
            <div className="mt-2 text-xs text-gray-500 text-center">
                Family connections visualized • This diagram updates as you share more information
            </div>
        </div>
    );
};

export default MermaidDiagram; 