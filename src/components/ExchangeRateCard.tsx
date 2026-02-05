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
    <div
      onClick={refetch}
      className="text-center cursor-pointer hover:opacity-80 transition-opacity"
    >
      {isLoading ? (
        <span className="text-text-secondary text-xs">加载中...</span>
      ) : error ? (
        <span className="text-red-400 text-xs">{error}</span>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="text-text-secondary text-xs">
            1 KRW = {rate ? rate.toFixed(4) : '0'} CNY
          </span>
          {lastUpdate && (
            <span className="text-text-secondary text-xs">
              更新: {formatTime(lastUpdate)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
