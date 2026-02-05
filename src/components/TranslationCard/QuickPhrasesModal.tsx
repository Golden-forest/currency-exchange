'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhraseCategory, Phrase } from '@/types/translation';
import { PHRASE_CATEGORIES, PHRASES_BY_CATEGORY } from '@/data/phraseLibrary';
import { LONG_PRESS_DURATION } from '@/constants/modal';

/**
 * QuickPhrasesModal 组件的 Props
 */
interface QuickPhrasesModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 选择短语回调 */
  onPhraseSelect: (phrase: string) => void;
  /** 显示 Toast 提示 */
  showToast: (message: string) => void;
}

/**
 * 快捷短语弹窗组件
 *
 * 功能：
 * - 显示 6 个分类标签（横向滚动）
 * - 显示当前分类的短语列表
 * - 点击短语：使用并关闭弹窗
 * - 长按短语：切换收藏状态
 * - Neumorphism 设计风格
 * - Framer Motion 动画
 */
export const QuickPhrasesModal = React.memo<QuickPhrasesModalProps>(({
  isOpen,
  onClose,
  onPhraseSelect,
  showToast,
}) => {
  // 当前选中的分类
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory>('greeting');

  // 收藏的短语 ID 列表（从 LocalStorage 加载）
  const [favoritePhraseIds, setFavoritePhraseIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('favorite_phrases');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 长按定时器
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressedPhrase, setLongPressedPhrase] = useState<Phrase | null>(null);

  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState(false);

  // 组件挂载时检测设备类型
  React.useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(checkMobile);
  }, []);

  /**
   * 获取当前分类的短语列表
   */
  const currentPhrases = useMemo<Phrase[]>(() => {
    return PHRASES_BY_CATEGORY[selectedCategory] || [];
  }, [selectedCategory]);

  /**
   * 保存收藏到 LocalStorage
   */
  const saveFavorites = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem('favorite_phrases', JSON.stringify([...ids]));
    } catch (error) {
      console.error('保存收藏失败:', error);
    }
  }, []);

  /**
   * 切换收藏状态
   */
  const toggleFavorite = useCallback((phrase: Phrase) => {
    const newFavorites = new Set(favoritePhraseIds);
    if (newFavorites.has(phrase.id)) {
      newFavorites.delete(phrase.id);
    } else {
      newFavorites.add(phrase.id);
    }
    setFavoritePhraseIds(newFavorites);
    saveFavorites(newFavorites);

    // 显示 Toast 提示
    const message = newFavorites.has(phrase.id)
      ? `已收藏: ${phrase.zh}`
      : `已取消收藏: ${phrase.zh}`;

    showToast(message);
  }, [favoritePhraseIds, saveFavorites, showToast]);

  /**
   * 处理短语点击
   */
  const handlePhraseClick = useCallback((phrase: Phrase) => {
    // 关闭弹窗
    onClose();
    // 调用选择回调
    onPhraseSelect(phrase.zh);
  }, [onClose, onPhraseSelect]);

  /**
   * 处理短语长按开始
   */
  const handlePhrasePressStart = useCallback((phrase: Phrase) => {
    const timer = setTimeout(() => {
      setLongPressedPhrase(phrase);
      toggleFavorite(phrase);
    }, LONG_PRESS_DURATION);
    setLongPressTimer(timer);
  }, [toggleFavorite]);

  /**
   * 处理短语长按结束
   */
  const handlePhrasePressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setLongPressedPhrase(null);
  }, [longPressTimer]);

  /**
   * 处理背景点击关闭
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  /**
   * 渲染分类标签
   */
  const renderCategoryTabs = () => {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.keys(PHRASE_CATEGORIES) as PhraseCategory[]).map((category) => {
          const meta = PHRASE_CATEGORIES[category];
          const isSelected = selectedCategory === category;

          return (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-[#1ABC9C] text-white shadow-glow-primary'
                  : 'bg-white text-[#636E72] shadow-soft-out-sm hover:shadow-soft-out-md'
              }`}
            >
              <span className="text-lg">{meta.icon}</span>
              <span className="text-sm font-bold">{meta.name}</span>
            </motion.button>
          );
        })}
      </div>
    );
  };

  /**
   * 渲染短语卡片
   */
  const renderPhraseCard = (phrase: Phrase) => {
    const isFavorite = favoritePhraseIds.has(phrase.id);
    const isPressed = longPressedPhrase?.id === phrase.id;

    return (
      <motion.div
        key={phrase.id}
        whileHover={{ scale: isMobile ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handlePhraseClick(phrase)}
        onMouseDown={() => !isMobile && handlePhrasePressStart(phrase)}
        onMouseUp={() => !isMobile && handlePhrasePressEnd()}
        onMouseLeave={() => !isMobile && handlePhrasePressEnd()}
        onTouchStart={() => isMobile && handlePhrasePressStart(phrase)}
        onTouchEnd={() => isMobile && handlePhrasePressEnd()}
        className={`bg-white/90 rounded-[2rem] p-4 shadow-soft-out-sm border border-white cursor-pointer relative overflow-hidden transition-all ${
          isPressed ? 'scale-95' : ''
        }`}
      >
        {/* 收藏图标 */}
        <motion.div
          className="absolute top-3 right-3"
          animate={{ scale: isFavorite ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-[#FF6B81]' : 'text-[#CBD5E1]'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </motion.div>

        {/* 短语内容 */}
        <div className="pr-8">
          {/* 中文 */}
          <div className="text-base font-bold text-[#2D3436] mb-1">
            {phrase.zh}
          </div>

          {/* 韩文 */}
          <div className="text-sm font-medium text-[#1ABC9C] mb-0.5">
            {phrase.ko}
          </div>

          {/* 罗马音 */}
          <div className="text-xs text-[#94A3B8] italic">
            {phrase.romanization}
          </div>
        </div>

        {/* 长按提示（仅在被长按时显示） */}
        {isPressed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[2rem]"
          >
            <span className="text-white text-sm font-bold">
              {isFavorite ? '已取消收藏' : '已收藏'}
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  };

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
                  快捷短语
                </h2>
                <p className="text-sm text-[#636E72] mt-1">
                  选择分类，点击使用
                </p>
              </div>

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

            {/* 分类标签栏 */}
            <div className="mb-6">
              {renderCategoryTabs()}
            </div>

            {/* 短语列表（可滚动） */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {currentPhrases.map((phrase) => renderPhraseCard(phrase))}

              {/* 空状态（不应该发生，但保留作为兜底） */}
              {currentPhrases.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <div className="text-lg font-bold text-[#636E72]">
                    该分类暂无短语
                  </div>
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[#A4B0BE]">
                💡 长按短语可收藏/取消收藏
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

QuickPhrasesModal.displayName = 'QuickPhrasesModal';
