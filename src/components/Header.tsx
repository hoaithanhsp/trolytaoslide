import React from 'react';
import { Settings, Presentation, Key, Sparkles } from 'lucide-react';

interface HeaderProps {
    onOpenSettings: () => void;
    hasApiKey: boolean;
}

export function Header({ onOpenSettings, hasApiKey }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-50"></div>
                            <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
                                <Presentation className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                                AI Slide Generator
                                <Sparkles className="w-4 h-4 text-purple-400" />
                            </h1>
                            <p className="text-xs text-slate-400">Tạo slide thuyết trình với AI</p>
                        </div>
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={onOpenSettings}
                        className="flex items-center gap-3 px-4 py-2.5 glass hover:bg-white/10 rounded-xl transition-all duration-200 group border border-white/10 hover:border-purple-500/50"
                    >
                        <div className="flex items-center gap-2">
                            {hasApiKey ? (
                                <Settings className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors group-hover:rotate-90 duration-300" />
                            ) : (
                                <Key className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                            )}
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                Settings
                            </span>
                        </div>
                        {!hasApiKey && (
                            <span className="text-xs font-medium text-red-400 animate-pulse px-2 py-1 bg-red-500/20 rounded-lg">
                                Cần API key
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
