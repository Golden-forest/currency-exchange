'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { speak, isSpeechSynthesisSupported } from '@/services/ttsService';
import { LANGUAGE_NAMES } from '@/types/translation';
import { debounce } from '@/utils/debounce';
import { ALL_PHRASES } from '@/data/phraseLibrary';
import type { Phrase } from '@/types/translation';

/**
 * TranslationCard 组件
 *
 * 功能：
 * - 文本输入翻译（中韩互译）
 * - 实时翻译（debounce 500ms）
 * - 语言切换
 * - 语音播放（使用 Web Speech Synthesis API）
 * - 复制到剪贴板 + Toast 提示
 * - 显示翻译历史
 * - 显示加载状态和错误状态
 * - 快捷短语动态加载（显示最常用的 2 个）
 */
export function TranslationCard() {
  // ===== 状态管理 =====

  const {
    sourceText,
    setSourceText,
    targetText,
    sourceLang,
    targetLang,
    romanization,
    isLoading,
    error,
    translate,
    swapLanguages,
    clearError,
  } = useTranslation({
    initialSourceLang: 'zh',
    initialTargetLang: 'ko',
    loadHistory: true,
  });

  /** Toast 提示状态 */
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: '' });

  /** 是否正在播放 */
  const [isPlaying, setIsPlaying] = useState(false);

  /** 输入框引用 */
  const [inputValue, setInputValue] = useState('');

  /**
   * 快捷短语列表
   * 从短语库中动态加载最常用的 2 个短语
   * 优先显示问候类和餐厅类短语（使用频率最高）
   */
  const quickPhrases = useMemo<Phrase[]>(() => {
    // 定义常用短语 ID（基于使用频率）
    const commonPhraseIds = [
      'greeting_01', // 你好
      'restaurant_01', // 请问这个多少钱？
    ];

    // 从短语库中查找对应的短语
    const phrases: Phrase[] = [];
    for (const id of commonPhraseIds) {
      const phrase = ALL_PHRASES.find(p => p.id === id);
      if (phrase) {
        phrases.push(phrase);
      }
    }

    // 如果找不到预定义的短语，则返回前 2 个
    if (phrases.length === 0) {
      return ALL_PHRASES.slice(0, 2);
    }

    return phrases;
  }, []);

  // ===== 核心操作 =====

  /**
   * 显示 Toast 提示
   */
  const showToast = useCallback((message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2000);
  }, []);

  /**
   * 复制到剪贴板
   */
  const handleCopy = useCallback(async () => {
    if (!targetText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(targetText);
      showToast('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      showToast('复制失败');
    }
  }, [targetText, showToast]);

  /**
   * 播放语音
   */
  const handlePlay = useCallback(async () => {
    if (!targetText) {
      return;
    }

    if (!isSpeechSynthesisSupported()) {
      showToast('您的浏览器不支持语音播放');
      return;
    }

    if (isPlaying) {
      showToast('正在播放中...');
      return;
    }

    setIsPlaying(true);
    try {
      await speak(targetText, targetLang);
      showToast('播放完成');
    } catch (error) {
      console.error('播放失败:', error);
      showToast('播放失败');
    } finally {
      setIsPlaying(false);
    }
  }, [targetText, targetLang, isPlaying, showToast]);

  /**
   * 处理文本输入
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSourceText(value);
    clearError();

    // 实时翻译（debounce 500ms）
    if (value.trim()) {
      debouncedTranslate(value);
    } else {
      // 清空输入时，也清空结果
      setInputValue('');
      setSourceText('');
    }
  }, [clearError]);

  /**
   * Debounce 翻译函数
   */
  const debouncedTranslate = debounce((text: string) => {
    translate(text);
  }, 500);

  /**
   * 处理语言交换
   */
  const handleSwapLanguages = useCallback(() => {
    swapLanguages();
    // 交换输入框的值
    if (targetText) {
      setInputValue(targetText);
    } else {
      setInputValue('');
    }
  }, [swapLanguages, targetText]);

  /**
   * 使用快捷短语
   */
  const handleQuickPhrase = useCallback((text: string) => {
    setInputValue(text);
    setSourceText(text);
    translate(text);
  }, [translate]);

  // ===== 渲染辅助函数 =====

  /**
   * 渲染加载状态
   */
  const renderLoading = () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="w-12 h-12 border-4 border-[#1ABC9C] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm font-medium text-[#94A3B8]">翻译中...</span>
      </div>
    </div>
  );

  /**
   * 渲染错误状态
   */
  const renderError = () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2 text-center px-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-red-500">{error}</span>
        <button
          onClick={clearError}
          className="text-xs font-bold text-[#1ABC9C] hover:underline"
        >
          关闭
        </button>
      </div>
    </div>
  );

  /**
   * 渲染翻译结果
   */
  const renderResult = () => {
    if (isLoading) {
      return renderLoading();
    }

    if (error) {
      return renderError();
    }

    if (!targetText) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-lg font-medium text-[#94A3B8] mb-2">
              请输入要翻译的文本
            </div>
            <div className="text-xs text-[#CBD5E1]">
              支持中文 ↔ 韩语互译
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col justify-center relative">
        {/* 翻译结果 */}
        <div className="text-3xl sm:text-4xl font-extrabold text-[#065F46] mb-2 tracking-tight">
          {targetText}
        </div>

        {/* 罗马音（韩文发音） */}
        {romanization && (
          <div className="text-sm sm:text-base italic text-[#94A3B8] font-medium">
            {romanization}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="absolute right-6 bottom-6 flex gap-3">
          {/* 复制按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-[#64748B] shadow-soft-out-sm border border-gray-50 active:shadow-soft-in"
            title="复制"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </motion.button>

          {/* 播放按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            disabled={isPlaying}
            className="w-11 h-11 bg-[#1ABC9C] rounded-full flex items-center justify-center text-white shadow-glow-primary active:scale-95 transition-transform disabled:opacity-50"
            title="播放"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    );
  };

  // ===== 主渲染 =====

  return (
    <div className="w-full max-w-lg bg-white/90 glass-container rounded-[3.5rem] p-6 sm:p-8 shadow-soft-out-lg relative overflow-hidden h-full flex flex-col border border-white/50">
      {/* Card Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] bg-clip-text text-transparent">
          Road to Freedom
        </h2>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 px-2">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#1ABC9C] tracking-[0.2em] uppercase mb-1">
            TRAVEL ASSISTANT
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D3436] tracking-tight">
            Translation
          </h2>
        </div>
        <button className="w-12 h-12 bg-white rounded-full shadow-soft-out-sm flex items-center justify-center text-[#636E72] active:shadow-soft-in transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Quick Phrases */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3 px-2">
          <span className="text-[11px] font-bold text-[#A4B0BE] tracking-wider uppercase">
            Quick Phrases
          </span>
          <span className="text-[11px] font-bold text-[#1ABC9C] cursor-pointer hover:underline">
            View All
          </span>
        </div>
        <div className="flex gap-3 px-1">
          {/* 动态渲染快捷短语 */}
          {quickPhrases.map((phrase) => (
            <motion.div
              key={phrase.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickPhrase(phrase.zh)}
              className="bg-white/90 rounded-[2.5rem] p-3 flex items-center shadow-soft-out-sm flex-1 border border-white cursor-pointer"
            >
              <div className="text-[#1ABC9C] text-[10px] mr-2.5">▶</div>
              <div>
                <div className="font-bold text-[#2D3436] text-xs sm:text-sm">{phrase.zh}</div>
                <div className="text-[9px] sm:text-[10px] text-[#A4B0BE] font-medium">{phrase.romanization}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Language Selector */}
      <div className="px-2 mb-4">
        <div className="bg-white/80 rounded-full p-1.5 flex items-center justify-between shadow-soft-out-sm border border-white">
          {/* 源语言 */}
          <div className="flex items-center gap-2.5 pl-4 py-1">
            <span className="text-sm font-bold text-[#2D3436]">
              {LANGUAGE_NAMES[sourceLang]}
            </span>
          </div>

          {/* 交换按钮 */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapLanguages}
            className="w-10 h-10 bg-[#1ABC9C] rounded-full shadow-glow-primary flex items-center justify-center text-white cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </motion.div>

          {/* 目标语言 */}
          <div className="flex items-center gap-2.5 pr-4 py-1">
            <span className="text-sm font-bold text-[#2D3436]">
              {LANGUAGE_NAMES[targetLang]}
            </span>
          </div>
        </div>
      </div>

      {/* Text Input Card */}
      <div className="px-1 mb-4">
        <div className="bg-white rounded-[2.5rem] p-5 sm:p-6 shadow-soft-out-sm relative min-h-[120px]">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder="请输入要翻译的文本..."
            className="w-full h-full resize-none bg-transparent text-2xl sm:text-3xl font-extrabold text-[#2D3436] leading-snug focus:outline-none placeholder:text-[#CBD5E1]"
            rows={3}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Result Card */}
      <div className="px-1 mb-4 flex-1">
        <div className="bg-white/90 rounded-[2.5rem] p-5 sm:p-6 shadow-soft-out-lg border border-white h-full">
          {renderResult()}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-center px-6 pb-2">
        {/* Type 按钮 */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-soft-out-sm flex items-center justify-center text-[#94A3B8] border border-gray-50 group-active:shadow-soft-in">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Type</span>
        </div>

        {/* 麦克风按钮 */}
        <div className="relative">
          <button className="relative w-20 h-20 bg-gradient-to-tr from-[#1ABC9C] to-[#2ECC71] rounded-full flex items-center justify-center text-white shadow-soft-out-sm active:scale-95 active:shadow-soft-in transition-all duration-200">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        </div>

        {/* Scan 按钮 */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-soft-out-sm flex items-center justify-center text-[#94A3B8] border border-gray-50 group-active:shadow-soft-in">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Scan</span>
        </div>
      </div>

      {/* Toast 提示 */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#2D3436] text-white px-6 py-3 rounded-full shadow-lg z-50"
        >
          <span className="text-sm font-medium">{toast.message}</span>
        </motion.div>
      )}
    </div>
  );
}
