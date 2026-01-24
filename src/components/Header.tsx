import React from 'react';
import { Settings, Presentation, Key } from 'lucide-react';

interface HeaderProps {
    onOpenSettings: () => void;
    hasApiKey: boolean;
}

export function Header({ onOpenSettings, hasApiKey }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
                            <Presentation className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                AI Slide Generator
                            </h1>
                            <p className="text-xs text-slate-500">Tạo slide thuyết trình với AI</p>
                        </div>
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={onOpenSettings}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-2">
                            {hasApiKey ? (
                                <Settings className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                            ) : (
                                <Key className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                            )}
                            <span className="text-sm font-medium text-slate-700">
                                Settings (API Key)
                            </span>
                        </div>
                        {!hasApiKey && (
                            <span className="text-xs font-medium text-red-500 animate-pulse">
                                Lấy API key để sử dụng app
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
