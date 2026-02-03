'use client';

import { Currency } from '@/types';

interface QuickButtonsProps {
  currency: Currency;
  onSelectAmount: (amount: number) => void;
}

const QUICK_AMOUNTS = {
  KRW: [
    { label: '1K', value: 1000 },
    { label: '5K', value: 5000 },
    { label: '10K', value: 10000 },
    { label: '50K', value: 50000 },
  ],
  CNY: [
    { label: '¥10', value: 10 },
    { label: '¥50', value: 50 },
    { label: '¥100', value: 100 },
    { label: '¥500', value: 500 },
  ],
};

export function QuickButtons({ currency, onSelectAmount }: QuickButtonsProps) {
  const amounts = QUICK_AMOUNTS[currency];

  return (
    <div className="grid grid-cols-2 gap-3">
      {amounts.map((item) => (
        <button
          key={item.label}
          onClick={() => onSelectAmount(item.value)}
          className="py-4 px-6 bg-bg-card border border-gold-border rounded-xl font-semibold text-lg text-text-primary hover:border-gold hover:shadow-gold transition-all active:scale-95"
        >
          {item.label}
        </button>
      ))}
      <button
        onClick={() => {
          const customAmount = prompt('请输入金额:');
          if (customAmount && !isNaN(Number(customAmount))) {
            onSelectAmount(Number(customAmount));
          }
        }}
        className="col-span-2 py-4 px-6 bg-bg-card border border-gold-border rounded-xl font-semibold text-lg text-text-primary hover:border-gold hover:shadow-gold transition-all active:scale-95"
      >
        自定义
      </button>
    </div>
  );
}
