import React, { useState, useEffect } from 'react';
import { Key, Info, ExternalLink, X, Cpu, Server, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelSelector } from './ModelSelector';
import { AiProvider } from '../types';
import { 
  GEMINI_MODELS, 
  AGENT_PLATFORM_MODELS, 
  DEFAULT_GEMINI_MODEL, 
  DEFAULT_AGENT_PLATFORM_MODEL,
  GOOGLE_AI_API_KEY_PATTERN
} from '../utils/constants';
import { cn } from '../lib/utils';

export interface SaveConfigPayload {
  provider: AiProvider;
  geminiApiKey: string;
  agentPlatformApiKey: string;
  apiKey: string;
  model: string;
}

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: SaveConfigPayload) => void;
  provider: AiProvider;
  geminiApiKey: string;
  agentPlatformApiKey: string;
  selectedModel: string;
  onModelSelect: (id: string) => void;
  forceOpen?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  provider: initialProvider,
  geminiApiKey: initialGeminiKey,
  agentPlatformApiKey: initialAgentPlatformKey,
  selectedModel: initialModel,
  onModelSelect,
  forceOpen
}) => {
  const [activeProvider, setActiveProvider] = useState<AiProvider>(initialProvider || 'gemini');
  const [geminiKey, setGeminiKey] = useState(initialGeminiKey || '');
  const [agentPlatformKey, setAgentPlatformKey] = useState(initialAgentPlatformKey || '');
  const [currentModel, setCurrentModel] = useState(initialModel || DEFAULT_GEMINI_MODEL);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setActiveProvider(initialProvider || 'gemini');
    setGeminiKey(initialGeminiKey || '');
    setAgentPlatformKey(initialAgentPlatformKey || '');
    setCurrentModel(initialModel || DEFAULT_GEMINI_MODEL);
    setValidationError('');
  }, [initialProvider, initialGeminiKey, initialAgentPlatformKey, initialModel, isOpen]);

  const handleProviderChange = (newProvider: AiProvider) => {
    setActiveProvider(newProvider);
    setValidationError('');

    // Tự động chuyển model mặc định tương thích nếu model hiện tại không thuộc provider mới
    if (newProvider === 'agent-platform') {
      const isCompatible = AGENT_PLATFORM_MODELS.some(m => m.id === currentModel);
      if (!isCompatible) {
        const nextModel = DEFAULT_AGENT_PLATFORM_MODEL;
        setCurrentModel(nextModel);
        onModelSelect(nextModel);
      }
    } else {
      const isCompatible = GEMINI_MODELS.some(m => m.id === currentModel);
      if (!isCompatible) {
        const nextModel = DEFAULT_GEMINI_MODEL;
        setCurrentModel(nextModel);
        onModelSelect(nextModel);
      }
    }
  };

  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId);
    onModelSelect(modelId);
  };

  const handleSave = () => {
    const activeKey = activeProvider === 'agent-platform' ? agentPlatformKey : geminiKey;
    const trimmed = activeKey.trim();

    if (!trimmed) {
      setValidationError('Vui lòng nhập API Key cho dịch vụ đã chọn.');
      return;
    }

    if (!GOOGLE_AI_API_KEY_PATTERN.test(trimmed)) {
      setValidationError('API Key phải bắt đầu bằng AIzaSy... hoặc AQ... và đủ độ dài.');
      return;
    }

    onSave({
      provider: activeProvider,
      geminiApiKey: geminiKey.trim(),
      agentPlatformApiKey: agentPlatformKey.trim(),
      apiKey: trimmed,
      model: currentModel,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-teal-600" />
                Cài đặt AI Provider & API Key
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lựa chọn nhà cung cấp AI và cấu hình model sử dụng cho ứng dụng
              </p>
            </div>
            {!forceOpen && (
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* 1. Chọn Nhà cung cấp AI (Provider) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                1. Chọn Nhà cung cấp (AI Provider)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleProviderChange('gemini')}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 relative",
                    activeProvider === 'gemini'
                      ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-teal-300"
                  )}
                >
                  <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">Gemini API</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Google AI Studio (Mặc định)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderChange('agent-platform')}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 relative",
                    activeProvider === 'agent-platform'
                      ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-teal-300"
                  )}
                >
                  <Server className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">Agent Platform API</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Google Cloud Agent Platform</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Cấu hình API Key cho Provider đang chọn */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-teal-600" />
                2. API Key ({activeProvider === 'agent-platform' ? 'Agent Platform API' : 'Gemini API'})
              </h4>

              {activeProvider === 'gemini' ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3.5 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <p className="font-medium">Bạn chưa có Gemini API Key?</p>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline font-semibold hover:text-blue-900 dark:hover:text-blue-200"
                    >
                      Lấy API Key tại Google AI Studio <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3.5 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-800 dark:text-indigo-300 space-y-1">
                    <p className="font-medium">Bạn chưa có Agent Platform API Key?</p>
                    <a
                      href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline font-semibold hover:text-indigo-900 dark:hover:text-indigo-200"
                    >
                      Xem hướng dẫn tạo Key tại Google Cloud Console <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {activeProvider === 'agent-platform' ? 'Agent Platform API Key:' : 'Gemini API Key:'}
                </label>
                {activeProvider === 'gemini' ? (
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => {
                      setGeminiKey(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="AIzaSy... hoặc AQ..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm font-mono"
                  />
                ) : (
                  <input
                    type="password"
                    value={agentPlatformKey}
                    onChange={(e) => {
                      setAgentPlatformKey(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="AQ... hoặc AIzaSy..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm font-mono"
                  />
                )}
                {validationError && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium pt-1">
                    ⚠️ {validationError}
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-700" />

            {/* 3. Chọn Model tương ứng với Provider */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-600" />
                3. Chọn Model ({activeProvider === 'agent-platform' ? 'Agent Platform' : 'Gemini'})
              </h4>
              <ModelSelector
                provider={activeProvider}
                selectedModel={currentModel}
                onSelect={handleModelChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
            {!forceOpen && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                Hủy
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all text-sm"
            >
              Lưu cấu hình
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
