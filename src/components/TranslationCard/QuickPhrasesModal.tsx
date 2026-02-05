'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhraseCategory, Phrase } from '@/types/translation';
import { PHRASE_CATEGORIES, PHRASES_BY_CATEGORY } from '@/data/phraseLibrary';

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
  /** 收藏状态变化回调 */
  onFavoriteChange?: () => void;
}

/**
 * 快捷短语弹窗组件
 *
 * 功能：
 * - 显示 6 个分类标签（横向滚动）
 * - 显示当前分类的短语列表
 * - 点击短语：直接发音，不关闭弹窗
 * - 点击爱心图标：切换收藏状态
 * - Neumorphism 设计风格
 * - Framer Motion 动画
 */
export const QuickPhrasesModal = React.memo<QuickPhrasesModalProps>(({
  isOpen,
  onClose,
  onPhraseSelect,
  showToast,
  onFavoriteChange,
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

  // 收藏的短语顺序列表（最新收藏的在前面）
  const [favoriteOrder, setFavoriteOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const order = localStorage.getItem('favorite_phrases_order');
      return order ? JSON.parse(order) : [];
    } catch {
      return [];
    }
  });

  /**
   * 获取当前分类的短语列表
   */
  const currentPhrases = useMemo<Phrase[]>(() => {
    return PHRASES_BY_CATEGORY[selectedCategory] || [];
  }, [selectedCategory]);

  /**
   * 保存收藏到 LocalStorage
   */
  const saveFavorites = useCallback((ids: Set<string>, order: string[]) => {
    try {
      localStorage.setItem('favorite_phrases', JSON.stringify([...ids]));
      localStorage.setItem('favorite_phrases_order', JSON.stringify(order));
    } catch (error) {
      console.error('保存收藏失败:', error);
    }
  }, []);

  /**
   * 切换收藏状态（点击爱心图标）
   */
  const toggleFavorite = useCallback((phrase: Phrase, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，不触发短语点击

    const newFavorites = new Set(favoritePhraseIds);
    let newOrder = [...favoriteOrder];

    if (newFavorites.has(phrase.id)) {
      // 取消收藏
      newFavorites.delete(phrase.id);
      newOrder = newOrder.filter(id => id !== phrase.id);
    } else {
      // 添加收藏，放到最前面
      newFavorites.add(phrase.id);
      newOrder.unshift(phrase.id);
    }

    setFavoritePhraseIds(newFavorites);
    setFavoriteOrder(newOrder);
    saveFavorites(newFavorites, newOrder);

    // 显示 Toast 提示
    const message = newFavorites.has(phrase.id)
      ? `已收藏: ${phrase.zh}`
      : `已取消收藏: ${phrase.zh}`;

    showToast(message);

    // 通知父组件收藏状态变化
    onFavoriteChange?.();
  }, [favoritePhraseIds, favoriteOrder, saveFavorites, showToast, onFavoriteChange]);

  /**
   * 处理短语点击（直接发音，不关闭弹窗）
   */
  const handlePhraseClick = useCallback((phrase: Phrase) => {
    // 调用选择回调（会在父组件中处理发音）
    onPhraseSelect(phrase.zh);
    // 不关闭弹窗，让用户可以继续选择其他短语
  }, [onPhraseSelect]);

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

    return (
      <motion.div
        key={phrase.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handlePhraseClick(phrase)}
        className="bg-white/90 rounded-[2rem] p-4 shadow-soft-out-sm border border-white cursor-pointer relative overflow-hidden transition-all"
      >
        {/* 收藏图标按钮 */}
        <motion.button
          onClick={(e) => toggleFavorite(phrase, e)}
          className="absolute top-3 right-3 z-10 p-1 hover:scale-110 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
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
        </motion.button>

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
                💡 点击短语发音，点击爱心收藏
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

QuickPhrasesModal.displayName = 'QuickPhrasesModal';
