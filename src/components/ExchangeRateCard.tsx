'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExchangeRate } from '@/hooks/useExchangeRate';

type Props = {
  onAddToLedger?: (rate: number) => void;
};

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

export function ExchangeRateCard({ onAddToLedger }: Props) {
  const { rate, lastUpdate, isLoading, error, refetch } = useExchangeRate();
  const [showAddButton, setShowAddButton] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // 当汇率加载成功时显示按钮
  useEffect(() => {
    if (rate && !isLoading && !error) {
      setShowAddButton(true);

      // 5秒后自动隐藏
      hideTimerRef.current = setTimeout(() => {
        setShowAddButton(false);
      }, 5000);
    }

    // 清理之前的定时器
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [rate, isLoading, error]);

  // 处理"记一笔"按钮点击
  const handleAddToLedger = () => {
    if (onAddToLedger && rate) {
      onAddToLedger(rate);
      setShowAddButton(false);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    }
  };

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
      className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity relative"
    >
      {isLoading ? (
        <span className="text-text-secondary text-xs font-medium">加载中...</span>
      ) : error ? (
        <span className="text-red-400 text-xs font-medium">{error}</span>
      ) : (
        <>
          {/* 汇率信息和更新时间 - 同一行显示 */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-text-secondary text-[10px]">1 CNY =</span>
            <span className="text-text-primary text-[11px] font-bold">{rate ? formatReverseRate(rate) : '-'}</span>
            <span className="text-text-secondary text-[10px]">KRW</span>
            {lastUpdate && (
              <>
                <span className="text-text-secondary text-[10px]">·</span>
                <span className="text-text-secondary text-[10px]">更新:</span>
                <span className="text-text-secondary text-[10px] font-medium">{formatTime(lastUpdate)}</span>
              </>
            )}
          </div>
        </>
      )}

      {/* 记一笔按钮 - 从底部滑入 */}
      <AnimatePresence>
        {showAddButton && rate && !isLoading && !error && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.3
            }}
            onClick={(e) => {
              e.stopPropagation(); // 防止触发 refetch
              handleAddToLedger();
            }}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2
                       px-6 py-2.5 rounded-full font-bold text-sm
                       bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3]
                       text-white shadow-lg
                       hover:shadow-xl hover:scale-105
                       active:scale-95
                       transition-all duration-200
                       whitespace-nowrap"
          >
            记一笔
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
