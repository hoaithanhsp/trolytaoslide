import { useState, useEffect, useCallback } from 'react';
import {
  validateApiKey,
  AiProvider,
  GEMINI_MODELS,
  AGENT_PLATFORM_MODELS,
} from '../services/geminiService';

const GEMINI_KEY_STORAGE = 'gemini_api_key';
const AGENT_PLATFORM_KEY_STORAGE = 'agent_platform_api_key';
const PROVIDER_STORAGE = 'google_ai_provider';
const PROVIDER_SOURCE_STORAGE = 'google_ai_provider_selection_source';
const GEMINI_MODEL_STORAGE = 'selected_ai_model';
const AGENT_PLATFORM_MODEL_STORAGE = 'selected_agent_platform_model';

export interface UseApiKeyReturn {
  provider: AiProvider;
  apiKey: string | null;
  geminiKey: string | null;
  agentPlatformKey: string | null;
  selectedModel: string;
  hasValidKey: boolean;
  isLoaded: boolean;
  setProvider: (provider: AiProvider) => void;
  setApiKey: (key: string, targetProvider?: AiProvider) => void;
  setSelectedModel: (model: string) => void;
  clearApiKey: (targetProvider?: AiProvider) => void;
}

export function useApiKey(): UseApiKeyReturn {
  const [provider, setProviderState] = useState<AiProvider>('gemini');
  const [geminiKey, setGeminiKeyState] = useState<string | null>(null);
  const [agentPlatformKey, setAgentPlatformKeyState] = useState<string | null>(null);
  const [selectedGeminiModel, setSelectedGeminiModelState] = useState<string>(GEMINI_MODELS[0].id);
  const [selectedAgentModel, setSelectedAgentModelState] = useState<string>(AGENT_PLATFORM_MODELS[0].id);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedProvider = localStorage.getItem(PROVIDER_STORAGE);
    let initialProvider: AiProvider = 'gemini';

    if (storedProvider === 'agent-platform') {
      initialProvider = 'agent-platform';
    } else if (storedProvider === 'vertex') {
      initialProvider = 'gemini';
      localStorage.setItem(PROVIDER_STORAGE, 'gemini');
      localStorage.setItem(PROVIDER_SOURCE_STORAGE, 'manual');
    }
    setProviderState(initialProvider);

    const storedGeminiKey = localStorage.getItem(GEMINI_KEY_STORAGE);
    const storedAgentKey = localStorage.getItem(AGENT_PLATFORM_KEY_STORAGE);

    setGeminiKeyState(storedGeminiKey || null);
    setAgentPlatformKeyState(storedAgentKey || null);

    const storedGeminiModel = localStorage.getItem(GEMINI_MODEL_STORAGE);
    if (storedGeminiModel && GEMINI_MODELS.some((m) => m.id === storedGeminiModel)) {
      setSelectedGeminiModelState(storedGeminiModel);
    } else {
      setSelectedGeminiModelState(GEMINI_MODELS[0].id);
      localStorage.setItem(GEMINI_MODEL_STORAGE, GEMINI_MODELS[0].id);
    }

    const storedAgentModel = localStorage.getItem(AGENT_PLATFORM_MODEL_STORAGE);
    if (storedAgentModel && AGENT_PLATFORM_MODELS.some((m) => m.id === storedAgentModel)) {
      setSelectedAgentModelState(storedAgentModel);
    } else {
      setSelectedAgentModelState(AGENT_PLATFORM_MODELS[0].id);
      localStorage.setItem(AGENT_PLATFORM_MODEL_STORAGE, AGENT_PLATFORM_MODELS[0].id);
    }

    setIsLoaded(true);
  }, []);

  const setProvider = useCallback((newProvider: AiProvider) => {
    setProviderState(newProvider);
    localStorage.setItem(PROVIDER_STORAGE, newProvider);
    localStorage.setItem(PROVIDER_SOURCE_STORAGE, 'manual');
  }, []);

  const setApiKey = useCallback((key: string, targetProvider?: AiProvider) => {
    const trimmed = key.trim();
    const target = targetProvider || provider;

    if (target === 'agent-platform') {
      if (trimmed) {
        setAgentPlatformKeyState(trimmed);
        localStorage.setItem(AGENT_PLATFORM_KEY_STORAGE, trimmed);
      } else {
        setAgentPlatformKeyState(null);
        localStorage.removeItem(AGENT_PLATFORM_KEY_STORAGE);
      }
    } else {
      if (trimmed) {
        setGeminiKeyState(trimmed);
        localStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
      } else {
        setGeminiKeyState(null);
        localStorage.removeItem(GEMINI_KEY_STORAGE);
      }
    }
  }, [provider]);

  const setSelectedModel = useCallback((model: string) => {
    if (provider === 'agent-platform') {
      if (AGENT_PLATFORM_MODELS.some((m) => m.id === model)) {
        setSelectedAgentModelState(model);
        localStorage.setItem(AGENT_PLATFORM_MODEL_STORAGE, model);
      } else {
        setSelectedAgentModelState(AGENT_PLATFORM_MODELS[0].id);
        localStorage.setItem(AGENT_PLATFORM_MODEL_STORAGE, AGENT_PLATFORM_MODELS[0].id);
      }
    } else {
      if (GEMINI_MODELS.some((m) => m.id === model)) {
        setSelectedGeminiModelState(model);
        localStorage.setItem(GEMINI_MODEL_STORAGE, model);
      } else {
        setSelectedGeminiModelState(GEMINI_MODELS[0].id);
        localStorage.setItem(GEMINI_MODEL_STORAGE, GEMINI_MODELS[0].id);
      }
    }
  }, [provider]);

  const clearApiKey = useCallback((targetProvider?: AiProvider) => {
    const target = targetProvider || provider;
    if (target === 'agent-platform') {
      setAgentPlatformKeyState(null);
      localStorage.removeItem(AGENT_PLATFORM_KEY_STORAGE);
    } else {
      setGeminiKeyState(null);
      localStorage.removeItem(GEMINI_KEY_STORAGE);
    }
  }, [provider]);

  const activeKey = provider === 'agent-platform' ? agentPlatformKey : geminiKey;
  const activeModel = provider === 'agent-platform' ? selectedAgentModel : selectedGeminiModel;
  const hasValidKey = !!activeKey && validateApiKey(activeKey);

  return {
    provider,
    apiKey: activeKey,
    geminiKey,
    agentPlatformKey,
    selectedModel: activeModel,
    hasValidKey,
    isLoaded,
    setProvider,
    setApiKey,
    setSelectedModel,
    clearApiKey,
  };
}
