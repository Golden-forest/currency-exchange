'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SettlementItem } from '@/types/trip';

type Props = {
  report: SettlementItem[];
  onClose: () => void;
  onClear?: () => void; // 可选的清空数据回调
};

export const SettlementModal = React.memo(({ report, onClose, onClear }: Props) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 处理清空数据
  const handleClear = () => {
    if (onClear) {
      onClear();
      setShowClearConfirm(false);
      onClose();
    }
  };

  // 处理背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 格式化金额
  const formatAmount = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  // 判断是否已结清(考虑浮点数精度)
  const isSettled = (balance: number): boolean => {
    return Math.abs(balance) < 0.01;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[3rem] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#2D3436] mb-2">
              算账报告
            </h2>
            <p className="text-sm text-[#636E72]">
              查看每个人的应付和已付金额
            </p>
          </div>

          {/* 算账报告表格 */}
          <div className="space-y-4 mb-8">
            {/* 表头 */}
            <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-[#F0F2F6] rounded-2xl">
              <div className="text-sm font-bold text-[#2D3436]">旅行者</div>
              <div className="text-sm font-bold text-[#2D3436] text-right">已付金额</div>
              <div className="text-sm font-bold text-[#2D3436] text-right">应付金额</div>
              <div className="text-sm font-bold text-[#2D3436] text-right">净额</div>
            </div>

            {/* 表格内容 */}
            {report.map((item) => {
              const settled = isSettled(item.balance);
              const shouldPay = item.balance > 0;      // 正数:应该付钱(应付 > 已付)
              const shouldReceive = item.balance < 0;  // 负数:应该收钱(已付 > 应付)

              return (
                <motion.div
                  key={item.traveler}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`grid grid-cols-4 gap-4 px-6 py-4 rounded-2xl transition-all ${
                    settled
                      ? 'bg-[#F0F2F6]'
                      : shouldReceive
                      ? 'bg-purple-50'
                      : 'bg-red-50'
                  }`}
                >
                  {/* 旅行者 */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.traveler.slice(-1)}
                    </div>
                    <span className="text-sm font-bold text-[#2D3436]">
                      {item.traveler}
                    </span>
                  </div>

                  {/* 已付金额 */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#636E72]">
                      {formatAmount(item.totalPaid)}
                    </div>
                  </div>

                  {/* 应付金额 */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#636E72]">
                      {formatAmount(item.totalShare)}
                    </div>
                  </div>

                  {/* 净额 */}
                  <div className="text-right">
                    {settled ? (
                      <div className="text-sm font-bold text-[#636E72]">
                        已结清
                      </div>
                    ) : shouldReceive ? (
                      <div>
                        <div className="text-xs text-purple-500 mb-1">应收</div>
                        <div className="text-sm font-bold text-purple-500">
                          {formatAmount(Math.abs(item.balance))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-red-500 mb-1">应付</div>
                        <div className="text-sm font-bold text-red-500">
                          {formatAmount(item.balance)}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 统计摘要 */}
          <div className="mb-8 px-6 py-4 bg-[#F0F2F6] rounded-2xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-[#636E72] mb-1">总已付</div>
                <div className="text-lg font-bold text-[#2D3436]">
                  {formatAmount(report.reduce((sum, item) => sum + item.totalPaid, 0))}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#636E72] mb-1">总应付</div>
                <div className="text-lg font-bold text-[#2D3436]">
                  {formatAmount(report.reduce((sum, item) => sum + item.totalShare, 0))}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#636E72] mb-1">未结清</div>
                <div className="text-lg font-bold text-[#8B5CF6]">
                  {report.filter((item) => !isSettled(item.balance)).length} 人
                </div>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-4">
            {onClear && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-6 py-3 rounded-2xl bg-[#F0F2F6] text-[#636E72] font-bold text-sm hover:bg-[#E9EDF2] active:scale-95 transition-all"
              >
                清空数据
              </button>
            )}
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all ${!onClear ? 'w-full' : ''}`}
            >
              关闭
            </button>
          </div>

          {/* 清空确认对话框 */}
          <AnimatePresence>
            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
                >
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-[#2D3436] mb-2">
                      确认清空数据?
                    </h3>
                    <p className="text-sm text-[#636E72]">
                      此操作将删除所有交易记录和设置,且无法恢复
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 px-6 py-3 rounded-2xl bg-[#F0F2F6] text-[#636E72] font-bold text-sm hover:bg-[#E9EDF2] active:scale-95 transition-all"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleClear}
                      className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
                    >
                      确认清空
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

SettlementModal.displayName = 'SettlementModal';
