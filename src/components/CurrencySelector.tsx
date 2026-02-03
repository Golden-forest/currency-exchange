'use client';

import { Currency } from '@/types';

interface CurrencySelectorProps {
  selected: Currency;
  onSelect: (currency: Currency) => void;
}

export function CurrencySelector({ selected, onSelect }: CurrencySelectorProps) {
  return (
    <div className="flex gap-3 justify-center">
      {(['KRW', 'CNY'] as Currency[]).map((currency) => (
        <button
          key={currency}
          onClick={() => onSelect(currency)}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            selected === currency
              ? 'bg-gold text-bg-dark border-gold'
              : 'bg-bg-card border border-gold-border text-text-primary'
          }`}
        >
          {currency === 'KRW' ? '韩币' : '人民币'}
        </button>
      ))}
    </div>
  );
}
