'use client';

import { Currency } from '@/types';

interface ConversionCardProps {
  amount: number;
  currency: Currency;
  label?: string;
  onClick?: () => void;
}

export function ConversionCard({ amount, currency, label, onClick }: ConversionCardProps) {
  const formatAmount = (num: number) => {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const currencyLabel = currency === 'KRW' ? '韩币 (KRW)' : '人民币 (CNY)';

  return (
    <div
      onClick={onClick}
      className="bg-bg-card border border-gold-border rounded-2xl p-8 text-center shadow-lg hover:shadow-gold transition-all cursor-pointer"
    >
      <div className="text-6xl font-bold text-gold mb-2">
        {formatAmount(amount)}
      </div>
      <div className="text-text-secondary text-base">
        {label || currencyLabel}
      </div>
    </div>
  );
}
