'use client';

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TranslationHistory } from '@/types/translation';
import { LANGUAGE_NAMES } from '@/types/translation';
import { formatTimestamp } from '@/utils/formatDate';
import { CLEAR_CONFIRM_DURATION, MAX_HISTORY_ITEMS } from '@/constants/modal';

/**
 * HistoryModal 组件的 Props
 */
interface HistoryModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 翻译历史记录 */
  history: TranslationHistory[];
  /** 删除单条记录回调 */
  onDeleteItem: (id: string) => void;
  /** 清空全部回调 */
  onClearAll: () => void;
  /** 选择历史记录回调 */
  onSelectHistory: (item: TranslationHistory) => void;
}

/**
 * 翻译历史弹窗组件
 *
 * 功能：
 * - 显示最近 20 条翻译记录
 * - 每条显示：源文本 + 翻译结果 + 时间
 * - 点击记录：重新显示结果
 * - 滑动删除 / 删除按钮
 * - 清空全部按钮（带确认）
 * - Neumorphism 设计风格
 * - Framer Motion 动画
 */
export const HistoryModal = React.memo<HistoryModalProps>(({
  isOpen,
  onClose,
  history,
  onDeleteItem,
  onClearAll,
  onSelectHistory,
}) => {
  // 确认清空状态
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  /**
   * 获取语言标签
   */
  const getLanguageLabel = useCallback((lang: string): string => {
    return LANGUAGE_NAMES[lang as keyof typeof LANGUAGE_NAMES] || lang;
  }, []);

  /**
   * 处理背景点击关闭
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  /**
   * 处理清空全部
   */
  const handleClearAll = useCallback(() => {
    if (showClearConfirm) {
      onClearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      // 自动取消确认
      setTimeout(() => {
        setShowClearConfirm(false);
      }, CLEAR_CONFIRM_DURATION);
    }
  }, [showClearConfirm, onClearAll]);

  /**
   * 处理选择历史记录
   */
  const handleSelectHistory = useCallback((item: TranslationHistory) => {
    onSelectHistory(item);
    onClose();
  }, [onSelectHistory, onClose]);

  /**
   * 渲染单条历史记录
   */
  const renderHistoryItem = (item: TranslationHistory) => {
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white/90 rounded-[2rem] p-4 shadow-soft-out-sm border border-white relative overflow-hidden hover:shadow-soft-out-md transition-all"
      >
        {/* 内容区域 */}
        <div
          className="cursor-pointer"
          onClick={() => handleSelectHistory(item)}
        >
          {/* 头部：语言和时间 */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1ABC9C] bg-[#E8F8F5] px-2 py-1 rounded-full">
                {getLanguageLabel(item.sourceLang)}
              </span>
              <svg className="w-4 h-4 text-[#A4B0BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-xs font-bold text-[#9B59B6] bg-[#F4ECF7] px-2 py-1 rounded-full">
                {getLanguageLabel(item.targetLang)}
              </span>
              {item.isOffline && (
                <span className="text-xs font-bold text-[#F39C12] bg-[#FEF5E7] px-2 py-1 rounded-full">
                  离线
                </span>
              )}
            </div>
            <span className="text-xs text-[#A4B0BE] font-medium">
              {formatTimestamp(item.timestamp)}
            </span>
          </div>

          {/* 源文本 */}
          <div className="mb-2">
            <div className="text-sm font-bold text-[#2D3436] line-clamp-2">
              {item.sourceText}
            </div>
          </div>

          {/* 翻译结果 */}
          <div className="mb-2">
            <div className="text-base font-bold text-[#1ABC9C] line-clamp-2">
              {item.targetText}
            </div>
            {item.romanization && (
              <div className="text-xs text-[#94A3B8] italic mt-1">
                {item.romanization}
              </div>
            )}
          </div>
        </div>

        {/* 删除按钮 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(item.id);
          }}
          className="absolute top-4 right-4 w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500 opacity-70 hover:opacity-100 transition-opacity"
          title="删除记录"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.button>
      </motion.div>
    );
  };

  /**
   * 排序后的历史记录（最新的在前）
   */
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_HISTORY_ITEMS);
  }, [history]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-[3rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // 防止点击内容区域关闭弹窗
          >
            {/* 标题栏 */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#2D3436]">
                  翻译历史
                </h2>
                <p className="text-sm text-[#636E72] mt-1">
                  {sortedHistory.length > 0 ? `最近 ${sortedHistory.length} 条记录` : '暂无历史记录'}
                </p>
              </div>

              <div className="flex gap-2">
                {/* 清空全部按钮 */}
                {sortedHistory.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearAll}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      showClearConfirm
                        ? 'bg-red-500 text-white'
                        : 'bg-[#F0F2F6] text-[#636E72] hover:bg-[#E9EDF2]'
                    }`}
                  >
                    {showClearConfirm ? '确认清空?' : '清空全部'}
                  </motion.button>
                )}

                {/* 关闭按钮 */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-12 h-12 bg-[#F0F2F6] rounded-full flex items-center justify-center text-[#636E72] hover:bg-[#E9EDF2] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* 历史记录列表（可滚动） */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {sortedHistory.length > 0 ? (
                sortedHistory.map((item) => renderHistoryItem(item))
              ) : (
                /* 空状态 */
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="text-6xl mb-4"
                  >
                    📝
                  </motion.div>
                  <div className="text-lg font-bold text-[#636E72] mb-2">
                    暂无翻译历史
                  </div>
                  <div className="text-sm text-[#A4B0BE]">
                    开始翻译后，历史记录会显示在这里
                  </div>
                </div>
              )}
            </div>

            {/* 底部提示 */}
            {sortedHistory.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-[#A4B0BE]">
                  💡 点击记录重新查看，点击右上角删除
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

HistoryModal.displayName = 'HistoryModal';
