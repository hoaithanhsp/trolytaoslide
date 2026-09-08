import { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Sparkles, Check, Server, ShieldCheck } from 'lucide-react';
import {
  AiProvider,
  GEMINI_MODELS,
  AGENT_PLATFORM_MODELS,
  validateApiKey,
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string | null;
  selectedModel: string;
  provider?: AiProvider;
  geminiKey?: string | null;
  agentPlatformKey?: string | null;
  onSelectProvider?: (provider: AiProvider) => void;
  onSaveKey: (key: string, provider?: AiProvider) => void;
  onSelectModel: (model: string) => void;
  forceShow?: boolean;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  selectedModel,
  provider = 'gemini',
  geminiKey,
  agentPlatformKey,
  onSelectProvider,
  onSaveKey,
  onSelectModel,
  forceShow = false,
}: ApiKeyModalProps) {
  const [activeProvider, setActiveProvider] = useState<AiProvider>(provider);
  const [inputKey, setInputKey] = useState<string>('');
  const [activeModel, setActiveModel] = useState<string>(selectedModel);
  const [error, setError] = useState('');

  // Đồng bộ khi modal mở hoặc props thay đổi
  useEffect(() => {
    setActiveProvider(provider);
    const keyToLoad = provider === 'agent-platform'
      ? (agentPlatformKey || (apiKey && provider === 'agent-platform' ? apiKey : ''))
      : (geminiKey || (apiKey && provider === 'gemini' ? apiKey : ''));
    setInputKey(keyToLoad || '');

    // Đảm bảo model tương thích với provider
    if (provider === 'agent-platform') {
      if (AGENT_PLATFORM_MODELS.some((m) => m.id === selectedModel)) {
        setActiveModel(selectedModel);
      } else {
        setActiveModel(AGENT_PLATFORM_MODELS[0].id);
      }
    } else {
      if (GEMINI_MODELS.some((m) => m.id === selectedModel)) {
        setActiveModel(selectedModel);
      } else {
        setActiveModel(GEMINI_MODELS[0].id);
      }
    }
  }, [isOpen, provider, apiKey, geminiKey, agentPlatformKey, selectedModel]);

  if (!isOpen) return null;

  // Xử lý đổi thẻ Provider (không tự sao chép key giữa 2 vùng)
  const handleSwitchProvider = (newProvider: AiProvider) => {
    setActiveProvider(newProvider);
    setError('');

    // Nạp key đã lưu riêng của provider đó
    const keyForProvider = newProvider === 'agent-platform' ? agentPlatformKey : geminiKey;
    setInputKey(keyForProvider || '');

    // Cập nhật model mặc định cho provider nếu model hiện tại không tương thích
    if (newProvider === 'agent-platform') {
      if (!AGENT_PLATFORM_MODELS.some((m) => m.id === activeModel)) {
        setActiveModel(AGENT_PLATFORM_MODELS[0].id);
      }
    } else {
      if (!GEMINI_MODELS.some((m) => m.id === activeModel)) {
        setActiveModel(GEMINI_MODELS[0].id);
      }
    }
  };

  const handleSave = () => {
    const trimmedKey = inputKey.trim();

    if (!trimmedKey) {
      setError('Vui lòng cấu hình API Key trước khi sử dụng tính năng này.');
      return;
    }

    if (!validateApiKey(trimmedKey)) {
      setError('API key không đúng định dạng. Key phải bắt đầu bằng "AIzaSy" hoặc "AQ" và có độ dài hợp lệ.');
      return;
    }

    setError('');
    onSelectProvider?.(activeProvider);
    onSaveKey(trimmedKey, activeProvider);
    onSelectModel(activeModel);
    onClose();
  };

  const handleClose = () => {
    if (!forceShow) {
      onClose();
    }
  };

  const currentModels = activeProvider === 'agent-platform' ? AGENT_PLATFORM_MODELS : GEMINI_MODELS;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cài đặt API & Nhà cung cấp</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                Cấu hình Gemini API hoặc Agent Platform API để tạo slide thông minh
              </p>
            </div>
          </div>
          {!forceShow && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Lựa chọn Nhà cung cấp (Gemini API vs Agent Platform API) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">
              Chọn dịch vụ API
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Thẻ Gemini API */}
              <button
                type="button"
                onClick={() => handleSwitchProvider('gemini')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative flex flex-col justify-between ${
                  activeProvider === 'gemini'
                    ? 'border-blue-500 bg-blue-50/70 shadow-md shadow-blue-100 ring-2 ring-blue-400/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {activeProvider === 'gemini' && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className={`w-4 h-4 ${activeProvider === 'gemini' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Google AI Studio
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Gemini API</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ đầy đủ model thế hệ mới Gemini 3.6, 3.5 và chuỗi fallback ổn định
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>Miễn phí & Trả phí</span>
                </div>
              </button>

              {/* Thẻ Agent Platform API */}
              <button
                type="button"
                onClick={() => handleSwitchProvider('agent-platform')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative flex flex-col justify-between ${
                  activeProvider === 'agent-platform'
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-md shadow-indigo-100 ring-2 ring-indigo-400/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {activeProvider === 'agent-platform' && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Server className={`w-4 h-4 ${activeProvider === 'agent-platform' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Google Cloud
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Agent Platform API</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Dành cho tài khoản Google Cloud doanh nghiệp / dự án có bật Agent Platform
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Endpoint chuyên biệt</span>
                </div>
              </button>
            </div>
          </div>

          {/* Model Selection theo Provider */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-semibold text-slate-700">
                Model AI ({activeProvider === 'gemini' ? 'Gemini API' : 'Agent Platform API'})
              </label>
              <span className="text-xs text-slate-500">
                Hệ thống tự động fallback nếu model quá tải
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
              {currentModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setActiveModel(model.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left relative ${
                    activeModel === model.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${activeModel === model.id ? 'text-blue-700' : 'text-slate-800'}`}>
                      {model.name}
                    </span>
                    {model.isDefault && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                        Mặc định
                      </span>
                    )}
                  </div>
                  {model.description && (
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {model.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Nhập API Key ({activeProvider === 'gemini' ? 'Gemini API' : 'Agent Platform API'})
              </label>
              <span className="text-xs text-slate-500">
                Chấp nhận định dạng AIzaSy... hoặc AQ...
              </span>
            </div>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setError('');
              }}
              placeholder="Nhập hoặc dán API Key (AIzaSy... hoặc AQ...)"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-mono text-sm ${
                error ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400'
              }`}
            />
            {error && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </p>
            )}
          </div>

          {/* Help Links & Gợi ý */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-200/80 text-xs">
            <div className="flex items-start gap-2.5">
              <Key className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-700 font-semibold">Lấy API Key chính thức: </span>
                {activeProvider === 'gemini' ? (
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Google AI Studio (aistudio.google.com/apikey)
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <a
                    href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Google Cloud Agent Platform Documentation
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <p>
                API Key được lưu an toàn trực tiếp trên trình duyệt của bạn (localStorage), không gửi qua máy chủ trung gian và không đưa vào log.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <Key className="w-4 h-4" />
            Lưu cấu hình API Key
          </button>
        </div>
      </div>
    </div>
  );
}
