'use client';

import { useExchangeRate } from '@/hooks/useExchangeRate';

/**
 * 智能格式化汇率数字
 * - 0.01-1: 显示4位小数
 * - 0.001-0.01: 显示5位小数
 * - <0.001: 使用科学计数法
 */
const formatRate = (rate: number): string => {
  if (rate >= 0.01) {
    return rate.toFixed(4);
  } else if (rate >= 0.001) {
    return rate.toFixed(5);
  } else {
    return rate.toExponential(2);
  }
};

/**
 * 计算反向汇率(1 CNY = ? KRW)
 */
const formatReverseRate = (rate: number): string => {
  const reverseRate = 1 / rate;
  if (reverseRate >= 1000) {
    return `${(reverseRate / 10000).toFixed(2)}万`;
  } else if (reverseRate >= 100) {
    return reverseRate.toFixed(1);
  } else {
    return reverseRate.toFixed(0);
  }
};

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
      className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
    >
      {isLoading ? (
        <span className="text-text-secondary text-xs font-medium">加载中...</span>
      ) : error ? (
        <span className="text-red-400 text-xs font-medium">{error}</span>
      ) : (
        <>
          {/* 主汇率 */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-text-secondary text-xs">1 KRW =</span>
            <span className="text-text-primary text-sm font-bold">{formatRate(rate)}</span>
            <span className="text-text-secondary text-xs">CNY</span>
          </div>

          {/* 反向汇率 */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-text-secondary text-[10px]">1 CNY ≈</span>
            <span className="text-text-secondary text-xs font-semibold">{formatReverseRate(rate)}</span>
            <span className="text-text-secondary text-[10px]">KRW</span>
          </div>

          {/* 更新时间 */}
          {lastUpdate && (
            <div className="flex items-center justify-center gap-1">
              <span className="text-text-secondary text-[10px]">更新:</span>
              <span className="text-text-secondary text-[10px] font-medium">{formatTime(lastUpdate)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
