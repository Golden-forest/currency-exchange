'use client';

import { useExchangeRate } from '@/hooks/useExchangeRate';

export function ExchangeRateCard() {
  const { rate, lastUpdate, isLoading, error, refetch } = useExchangeRate();

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-bg-card border border-gold-border rounded-xl p-4 text-center backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-text-secondary text-sm">汇率:</span>
        {isLoading ? (
          <span className="text-gold text-lg font-semibold">加载中...</span>
        ) : error ? (
          <span className="text-red-500 text-lg font-semibold">{error}</span>
        ) : (
          <span className="text-gold text-lg font-semibold">
            1 KRW = {rate ? rate.toFixed(4) : '0'} CNY
          </span>
        )}
      </div>
      <div className="text-text-secondary text-xs">
        {lastUpdate && `更新: ${formatTime(lastUpdate)}`}
      </div>
      <button
        onClick={refetch}
        className="mt-2 text-xs text-text-secondary hover:text-gold transition-colors"
      >
        刷新汇率
      </button>
    </div>
  );
}
