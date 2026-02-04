'use client';

import { Currency } from '@/types';
import { useEffect, useState } from 'react';

interface QuickButtonsProps {
  currency: Currency;
  onSelectAmount: (amount: number) => void;
}

const FIXED_AMOUNTS = {
  KRW: [
    { label: '1万', value: 10000 },
    { label: '5万', value: 50000 },
    { label: '10万', value: 100000 },
    { label: '50万', value: 500000 },
  ],
  CNY: [
    { label: '¥100', value: 100 },
    { label: '¥500', value: 500 },
    { label: '¥1000', value: 1000 },
    { label: '¥5000', value: 5000 },
  ],
};

const HISTORY_KEY = 'amountHistory';

// 格式化金额显示
const formatAmount = (value: number, currency: Currency): string => {
  if (currency === 'KRW') {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(value % 10000 === 0 ? 0 : 1)}万`;
    }
    return `${value}`;
  } else {
    return `¥${value}`;
  }
};

export function QuickButtons({ currency, onSelectAmount }: QuickButtonsProps) {
  const [history, setHistory] = useState<number[]>([]);

  // 加载历史记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 2)); // 只保留最近2条
        }
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }, []);

  const fixedAmounts = FIXED_AMOUNTS[currency];

  const handleSelectAmount = (amount: number) => {
    onSelectAmount(amount);

    // 更新历史记录
    setHistory((prev) => {
      const newHistory = [amount, ...prev.filter((v) => v !== amount)].slice(0, 2);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('保存历史记录失败:', error);
      }
      return newHistory;
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 历史记录按钮 - 动态 */}
      {history.length > 0 && (
        <>
          {history.map((amount, index) => (
            <button
              key={`history-${index}`}
              onClick={() => handleSelectAmount(amount)}
              className="py-3 px-6 bg-bg-card border border-gold-border/50 rounded-xl font-medium text-base text-text-primary hover:border-gold hover:shadow-gold transition-all active:scale-95"
            >
              {formatAmount(amount, currency)}
            </button>
          ))}
        </>
      )}

      {/* 固定金额按钮 */}
      {fixedAmounts.map((item) => (
        <button
          key={item.label}
          onClick={() => handleSelectAmount(item.value)}
          className="py-4 px-6 bg-bg-card border border-gold-border rounded-xl font-semibold text-lg text-text-primary hover:border-gold hover:shadow-gold transition-all active:scale-95"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
