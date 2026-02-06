'use client';

import { useState } from 'react';
import { ExchangeRateCard } from '@/components/ExchangeRateCard';
import { ConversionCard } from '@/components/ConversionCard';
import { QuickButtons } from '@/components/QuickButtons';
import { TaxRefundCard } from '@/components/TaxRefundCard';
import { motion } from 'framer-motion';

interface CurrencyConverterCardProps {
    cnyAmount: number;
    krwAmount: number;
    onCnyChange: (amount: number) => void;
    onKrwChange: (amount: number) => void;
    onQuickSelect: (amount: number) => void;
    onClear: () => void;
    lastEdited: 'cny' | 'krw';
    setLastEdited: (val: 'cny' | 'krw') => void;
    onAddToLedger?: (rate: number) => void;
}

export function CurrencyConverterCard({
    cnyAmount,
    krwAmount,
    onCnyChange,
    onKrwChange,
    onQuickSelect,
    onClear,
    lastEdited,
    setLastEdited,
    onAddToLedger
}: CurrencyConverterCardProps) {
    const [editingCard, setEditingCard] = useState<'cny' | 'krw' | null>(null);

    return (
        <div className="w-full max-w-lg bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] glass-container rounded-[3rem] sm:rounded-[4rem] p-4 sm:p-7 shadow-soft-out-lg relative">
            {/* Card Title */}
            <div className="text-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] bg-clip-text text-transparent">
                    Road to Freedom
                </h2>
            </div>
            {/* Sections Section */}
            <div className="flex flex-col gap-3 relative z-0">
                {/* Top Card: CNY */}
                <ConversionCard
                    amount={cnyAmount}
                    currency="CNY"
                    label="Chinese Yuan"
                    onAmountChange={onCnyChange}
                    isEditing={editingCard === 'cny'}
                    onEditStart={() => setEditingCard('cny')}
                    onEditEnd={() => setEditingCard(null)}
                />

                {/* Swap Button (Floating) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+4px)] z-10 transition-all">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setLastEdited(lastEdited === 'cny' ? 'krw' : 'cny');
                        }}
                        className="w-10 h-10 bg-[#8B5CF6] rounded-full shadow-glow-primary flex items-center justify-center text-white cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                        </svg>
                    </motion.div>
                </div>

                {/* Bottom Card: KRW */}
                <ConversionCard
                    amount={krwAmount}
                    currency="KRW"
                    label="South Korean Won"
                    onAmountChange={onKrwChange}
                    isEditing={editingCard === 'krw'}
                    onEditStart={() => setEditingCard('krw')}
                    onEditEnd={() => setEditingCard(null)}
                />
            </div>

            {/* Quick Add Section */}
            <div className="mt-4">
                <div className="flex justify-between items-center px-4 mb-2">
                    <span className="text-text-secondary text-[9px] font-bold tracking-widest uppercase">Quick Add</span>
                    <button
                        onClick={onClear}
                        className="text-[#8B5CF6] text-[9px] font-bold hover:opacity-70 transition-opacity"
                    >
                        Clear
                    </button>
                </div>
                <QuickButtons
                    currency={lastEdited === 'cny' ? 'CNY' : 'KRW'}
                    onSelectAmount={onQuickSelect}
                />
            </div>

            {/* Tax Refund Section */}
            <div className="mt-4">
                <TaxRefundCard krwAmount={krwAmount} />
            </div>

            {/* Local Rate Info */}
            <div className="mt-4">
                <ExchangeRateCard onAddToLedger={onAddToLedger} />
            </div>
        </div>
    );
}
