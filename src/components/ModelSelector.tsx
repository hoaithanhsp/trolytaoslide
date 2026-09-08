import React from 'react';
import { GEMINI_MODELS, AGENT_PLATFORM_MODELS, AiProvider } from '../utils/constants';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModelSelectorProps {
  provider?: AiProvider;
  selectedModel: string;
  onSelect: (id: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ provider = 'gemini', selectedModel, onSelect }) => {
  const models = provider === 'agent-platform' ? AGENT_PLATFORM_MODELS : GEMINI_MODELS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {models.map((model) => (
        <button
          key={model.id}
          type="button"
          onClick={() => onSelect(model.id)}
          className={cn(
            "relative p-3.5 rounded-2xl border-2 text-left transition-all group",
            selectedModel === model.id 
              ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20" 
              : "border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 bg-white dark:bg-gray-900"
          )}
        >
          {selectedModel === model.id && (
            <div className="absolute top-3 right-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
            </div>
          )}
          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1 pr-6">{model.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{model.desc}</p>
        </button>
      ))}
    </div>
  );
};
