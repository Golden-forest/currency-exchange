'use client';

import { motion } from 'framer-motion';

export function TripLedgerCard() {
    const transactions = [
        { id: 1, name: 'Gyeongbokgung Ti...', amount: '₩ 12,000', secondary: '¥ 65.20', time: '10:30 AM', icon: '🏯', split: 'Split by 4' },
        { id: 2, name: 'Street Food Market', amount: '₩ 45,000', secondary: '¥ 244.50', time: '12:15 PM', icon: '🍜', tag: "Sarah's Treat" },
        { id: 3, name: 'Hanbok Rental', amount: '₩ 60,000', secondary: '¥ 326.00', time: '01:45 PM', icon: '👘', split: 'Split by 2' },
        { id: 4, name: 'Cafe Onion Anguk', amount: '₩ 11,500', secondary: '¥ 62.50', time: '03:20 PM', icon: '☕' },
    ];

    return (
        <div className="w-full max-w-lg bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E1] rounded-[3rem] sm:rounded-[4rem] p-6 sm:p-8 shadow-soft-out-lg relative overflow-hidden h-full flex flex-col">
            {/* Card Title */}
            <div className="text-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] bg-clip-text text-transparent">
                    Road to Freedom
                </h2>
            </div>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#2D3436]">Trip Ledger</h2>
                    <div className="flex items-center text-[#636E72] mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Seoul, South Korea</span>
                    </div>
                </div>
                <button className="p-2 bg-white rounded-full shadow-soft-out-sm text-[#636E72]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            {/* Total Spent Card */}
            <div className="bg-[#1E272E] rounded-3xl p-6 text-white mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#FF6B81] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    ₩ Budget
                </div>
                <div className="text-sm font-medium opacity-60 mb-2">TOTAL SPENT</div>
                <div className="text-3xl font-bold mb-4">
                    ₩ 1,245,000 <span className="opacity-40 text-lg">/ 2M</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-white/20 rounded-full mb-2">
                    <div className="h-full bg-gradient-to-r from-[#FF6B81] to-[#F7D794] rounded-full" style={{ width: '62%' }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold opacity-60">
                    <span>62% used</span>
                    <span>₩ 755,000 left</span>
                </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-[#A4B0BE] tracking-widest uppercase">TODAY, OCT 24</span>
                    <span className="text-[10px] font-bold text-[#A4B0BE]">₩ 128,500</span>
                </div>

                <div className="space-y-3">
                    {transactions.map((t) => (
                        <div key={t.id} className="bg-white rounded-[2rem] p-4 flex items-center shadow-soft-out-sm border border-white/50">
                            <div className="w-12 h-12 bg-[#F1F2F6] rounded-full flex items-center justify-center text-2xl mr-4">
                                {t.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-[#2D3436] text-sm">{t.name}</h3>
                                    <div className="text-right">
                                        <div className="font-bold text-[#2D3436] text-sm">{t.amount}</div>
                                        <div className="text-[10px] text-[#A4B0BE]">{t.secondary}</div>
                                    </div>
                                </div>
                                <div className="flex items-center mt-1">
                                    {t.split && (
                                        <span className="text-[9px] bg-[#E3F2FD] text-[#2196F3] px-2 py-0.5 rounded-full font-bold mr-2">
                                            {t.split}
                                        </span>
                                    )}
                                    {t.tag && (
                                        <span className="text-[9px] bg-[#FFF3E0] text-[#FF9800] px-2 py-0.5 rounded-full font-bold mr-2">
                                            {t.tag}
                                        </span>
                                    )}
                                    <span className="text-[9px] text-[#CED6E0] font-medium ml-auto">{t.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Button */}
            <button className="absolute bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-[#FF6B81] to-[#FF9FF3] rounded-full shadow-lg flex items-center justify-center text-white text-4xl font-light active:scale-95 transition-transform">
                +
            </button>
        </div>
    );
}
