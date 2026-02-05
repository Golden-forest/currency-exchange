'use client';

import { motion } from 'framer-motion';

export function TranslationCard() {
    const quickPhrases = [
        { id: 1, text: 'Hello', sub: 'An-nyeong', icon: '▶' },
        { id: 2, text: 'How much?', sub: 'Ol-ma-ye-yo?', icon: '▶' },
    ];

    return (
        <div className="w-full max-w-lg bg-white/90 glass-container rounded-[3.5rem] p-6 sm:p-8 shadow-soft-out-lg relative overflow-hidden h-full flex flex-col border border-white/50">
            {/* Card Title */}
            <div className="text-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] bg-clip-text text-transparent">
                    Road to Freedom
                </h2>
            </div>

            {/* Status Bar */}
            <div className="flex justify-between items-center px-4 mb-4 opacity-40">
                <span className="text-xs font-bold">9:41</span>
                <div className="flex gap-1.5 items-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z" /></svg>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                    <div className="w-6 h-3 border border-current rounded-sm relative"><div className="absolute inset-y-0.5 left-0.5 right-1.5 bg-current rounded-px" /></div>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 px-2">
                <div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-[#1ABC9C] tracking-[0.2em] uppercase mb-1">TRAVEL ASSISTANT</div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D3436] tracking-tight">Translation</h2>
                </div>
                <button className="w-12 h-12 bg-white rounded-full shadow-soft-out-sm flex items-center justify-center text-[#636E72] active:shadow-soft-in transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>

            {/* Quick Phrases */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3 px-2">
                    <span className="text-[11px] font-bold text-[#A4B0BE] tracking-wider uppercase">Quick Phrases</span>
                    <span className="text-[11px] font-bold text-[#1ABC9C] cursor-pointer hover:underline">View All</span>
                </div>
                <div className="flex gap-3 px-1">
                    {quickPhrases.map((p) => (
                        <div key={p.id} className="bg-white/90 rounded-[2.5rem] p-3 flex items-center shadow-soft-out-sm flex-1 border border-white">
                            <div className="w-9 h-9 bg-[#E0FAF5] rounded-full flex items-center justify-center text-[#1ABC9C] text-[10px] mr-2.5 shadow-soft-in">
                                {p.icon}
                            </div>
                            <div>
                                <div className="font-bold text-[#2D3436] text-xs sm:text-sm">{p.text}</div>
                                <div className="text-[9px] sm:text-[10px] text-[#A4B0BE] font-medium">{p.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Language Selector */}
            <div className="px-2 mb-4">
                <div className="bg-white/80 rounded-full p-1.5 flex items-center justify-between shadow-soft-out-sm border border-white">
                    <div className="flex items-center gap-2.5 pl-4 py-1">
                        <span className="text-xl">🇨🇳</span>
                        <span className="text-sm font-bold text-[#2D3436]">Chinese</span>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full shadow-soft-out-sm flex items-center justify-center text-[#1ABC9C] border border-gray-50 active:shadow-soft-in">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-2.5 pr-4 py-1">
                        <span className="text-sm font-bold text-[#2D3436]">Korean</span>
                        <span className="text-xl">🇰🇷</span>
                    </div>
                </div>
            </div>

            {/* Text/Voice Input Card */}
            <div className="px-1 mb-4">
                <div className="bg-[#E0FAF5]/60 rounded-[2.5rem] p-5 sm:p-6 shadow-soft-in border border-[#B2EBE0]/40 relative min-h-[120px]">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-[#1ABC9C] tracking-widest uppercase">DETECTING VOICE...</span>
                        <button className="text-[#A4B0BE] text-xs">✕</button>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#2D3436] leading-snug">
                        请问这个多少钱？
                    </div>
                </div>
            </div>

            {/* Result Card */}
            <div className="px-1 mb-4 flex-1">
                <div className="bg-white/90 rounded-[2.5rem] p-5 sm:p-6 shadow-soft-out-lg border border-white h-full flex flex-col justify-center relative">
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#065F46] mb-2 tracking-tight">
                        이거 얼마예요?
                    </div>
                    <div className="text-sm sm:text-base italic text-[#94A3B8] font-medium">I-geo ol-ma-ye-yo?</div>

                    <div className="absolute right-6 bottom-6 flex gap-3">
                        <button className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-[#64748B] shadow-soft-out-sm border border-gray-50 active:shadow-soft-in">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button className="w-11 h-11 bg-[#1ABC9C] rounded-full flex items-center justify-center text-white shadow-glow-primary active:scale-95 transition-transform">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center px-6 pb-2">
                <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-soft-out-sm flex items-center justify-center text-[#94A3B8] border border-gray-50 group-active:shadow-soft-in">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Type</span>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-[#1ABC9C]/15 rounded-full blur-2xl animate-pulse" />
                    <div className="w-24 h-24 bg-white/40 rounded-full flex items-center justify-center shadow-soft-in">
                        <button className="w-18 h-18 bg-gradient-to-tr from-[#1ABC9C] to-[#2ECC71] rounded-full shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform">
                            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v11m0 0a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3zm0 0a7 7 0 01-7-7M12 21H8m4 0h4" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-soft-out-sm flex items-center justify-center text-[#94A3B8] border border-gray-50 group-active:shadow-soft-in">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <circle cx="12" cy="13" r="3" />
                        </svg>
                    </div>
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Scan</span>
                </div>
            </div>

            {/* Mobile indicator line */}
            <div className="flex justify-center mt-2 mb-1">
                <div className="w-24 h-1 bg-gray-200 rounded-full opacity-50" />
            </div>
        </div>
    );
}
