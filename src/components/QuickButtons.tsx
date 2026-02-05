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
    { label: '3万', value: 30000 },
    { label: '5万', value: 50000 },
    { label: '10万', value: 100000 },
    { label: '20万', value: 200000 },
    { label: '50万', value: 500000 },
  ],
  CNY: [
    { label: '¥100', value: 100 },
    { label: '¥300', value: 300 },
    { label: '¥500', value: 500 },
    { label: '¥1000', value: 1000 },
    { label: '¥2000', value: 2000 },
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
          setHistory(parsed.slice(0, 3)); // 只保留最近3条
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
      const newHistory = [amount, ...prev.filter((v) => v !== amount)].slice(0, 3);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('保存历史记录失败:', error);
      }
      return newHistory;
    });
  };

  return (
    <div className="grid grid-cols-3 gap-3 w-full p-1">
      {/* 历史记录按钮 - 动态,前3个位置 */}
      {history.map((amount, index) => (
        <button
          key={`history-${index}`}
          onClick={() => handleSelectAmount(amount)}
          className="py-3 px-2 rounded-full font-bold text-sm text-[#8B5CF6] bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] shadow-[4px_4px_8px_rgba(139,92,246,0.15),-2px_-2px_6px_rgba(255,255,255,0.8)] hover:scale-[1.05] active:scale-[0.98] transition-all duration-200"
        >
          {formatAmount(amount, currency)}
        </button>
      ))}

      {/* 固定金额按钮,填充剩余位置到9个 */}
      {fixedAmounts.slice(0, 9 - history.length).map((item) => (
        <button
          key={item.label}
          onClick={() => handleSelectAmount(item.value)}
          className="py-3 px-2 rounded-full font-bold text-sm text-[#334155] skeuo-pill hover:scale-[1.05] active:scale-[0.98] transition-all duration-200"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
