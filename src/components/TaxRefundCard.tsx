'use client';

import { motion } from 'framer-motion';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { NumberAnimation } from './NumberAnimation';

interface TaxRefundCardProps {
    krwAmount: number;
}

const REFUND_TIERS = [
    { min: 15000, refund: 1000 },
    { min: 30000, refund: 2000 },
    { min: 50000, refund: 3500 },
    { min: 75000, refund: 5000 },
    { min: 100000, refund: 6500 },
    { min: 125000, refund: 8000 },
    { min: 150000, refund: 9500 },
    { min: 175000, refund: 11000 },
    { min: 200000, refund: 12500 },
    { min: 250000, refund: 16000 },
    { min: 300000, refund: 19500 },
    { min: 400000, refund: 26500 },
    { min: 500000, refund: 33500 },
];

export function TaxRefundCard({ krwAmount }: TaxRefundCardProps) {
    const { rate } = useExchangeRate();

    // 计算当前退税额 (KRW)
    const getCurrentRefund = (amount: number) => {
        if (amount < 15000) return 0;

        let refund = 0;
        for (let i = REFUND_TIERS.length - 1; i >= 0; i--) {
            if (amount >= REFUND_TIERS[i].min) {
                refund = REFUND_TIERS[i].refund;
                break;
            }
        }
        return refund;
    };

    // 计算下一级需要再消费多少 (KRW)
    const getNextTierInfo = (amount: number) => {
        const nextTier = REFUND_TIERS.find(tier => tier.min > amount);
        if (!nextTier) return null;
        return {
            needed: nextTier.min - amount,
            nextMin: nextTier.min
        };
    };

    const refundKRW = getCurrentRefund(krwAmount);
    const refundCNY = rate ? refundKRW * rate : 0;
    const nextTier = getNextTierInfo(krwAmount);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-[100px] rounded-[2rem] p-4 flex items-center justify-between relative overflow-hidden shadow-soft-out"
            style={{
                background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 50%, #C4B5FD 100%)',
            }}
        >
            {/* Left Content */}
            <div className="flex flex-col h-full justify-between z-10">
                <div>
                    <div className="flex items-center gap-1.5 mb-0">
                        <span className="text-[8px] font-bold tracking-widest text-[#64748B] uppercase">Estimated Refund</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#8B5CF6] flex items-baseline gap-1">
                        <span className="text-lg">¥</span>
                        <NumberAnimation value={refundCNY} />
                    </div>
                </div>

                <div className="text-[9px] font-bold text-[#64748B]/70 leading-none">
                    {nextTier ? (
                        <>
                            Spend <span className="text-[#8B5CF6]">₩{nextTier.needed.toLocaleString()}</span> more to reach
                        </>
                    ) : (
                        "Max refund tier reached"
                    )}
                </div>
            </div>

            {/* Right Visual Element */}
            <div className="relative shrink-0 scale-90 sm:scale-100 origin-right flex flex-col items-center">
                {/* White Disk */}
                <div className="w-14 h-14 rounded-full bg-white shadow-soft-out-sm flex items-center justify-center relative">
                    {/* Shopping Bag Icon (SVG) */}
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
                        <rect x="5" y="9" width="14" height="12" rx="3" fill="#8B5CF6" />
                    </svg>
                </div>

                {/* Tax Free Text */}
                <span className="mt-1 text-[7px] font-bold bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] bg-clip-text text-transparent italic tracking-wider">
                    TAX FREE
                </span>
            </div>

            {/* Suble background glow */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/30 blur-2xl rounded-full"></div>
        </motion.div>
    );
}
