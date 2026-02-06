'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { speak, isSpeechSynthesisSupported, preloadVoices } from '@/services/ttsService';
import { extractText, getOCRErrorMessage } from '@/services/ocrService';
import { LANGUAGE_NAMES } from '@/types/translation';
import { ALL_PHRASES } from '@/data/phraseLibrary';
import type { Phrase, TranslationHistory } from '@/types/translation';
import { VoiceInputIndicator } from '@/components/TranslationCard/VoiceInputIndicator';
import { QuickPhrasesModal } from '@/components/TranslationCard/QuickPhrasesModal';
import { HistoryModal } from '@/components/TranslationCard/HistoryModal';
import { TOAST_DURATION } from '@/constants/modal';

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
  // ===== 语音预热 =====
  // 在组件挂载时预加载语音列表，确保首次播放时语音已就绪
  useEffect(() => {
    if (isSpeechSynthesisSupported()) {
      preloadVoices();
    }
  }, []);

  // ===== 状态管理 =====

  const {
    sourceText,
    setSourceText,
    targetText: hookTargetText,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    romanization: hookRomanization,
    isLoading,
    error,
    translate,
    swapLanguages,
    clearError,
    history,
    clearHistory,
    deleteHistoryItem,
  } = useTranslation({
    initialSourceLang: 'zh',
    initialTargetLang: 'ko',
    loadHistory: true,
  });

  // 本地状态，用于覆盖 hook 返回的值（主要用于历史记录选择）
  const [localTargetText, setLocalTargetText] = useState<string>('');
  const [localRomanization, setLocalRomanization] = useState<string>('');

  // 优先使用本地状态，如果没有则使用 hook 返回的值
  const targetText = localTargetText || hookTargetText;
  const romanization = localRomanization || hookRomanization;

  // ===== 语音识别状态 =====

  const {
    isListening,
    transcript: voiceTranscript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition({
    onTranscriptComplete: async (transcript) => {
      // 语音识别完成后，使用自动检测翻译
      setInputValue(transcript);

      try {
        // 调用服务端 API 进行翻译
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: transcript,
            autoDetect: true,
          }),
        });

        if (!response.ok) {
          throw new Error('翻译服务不可用');
        }

        const result = await response.json();

        // 更新界面显示
        setSourceText(transcript);
        setLocalTargetText(result.translatedText);
        setLocalRomanization(result.romanization || '');

        // 根据检测结果更新语言设置
        if (result.detectedSourceLang === 'zh') {
          setSourceLang('zh');
          setTargetLang('ko');
        } else {
          setSourceLang('ko');
          setTargetLang('zh');
        }
      } catch (error) {
        console.error('自动检测翻译失败:', error);
        showToast('翻译失败,请重试');
      }
    },
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

  /** 弹窗打开状态 */
  const [isQuickPhrasesOpen, setIsQuickPhrasesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  /** OCR 相关状态 */
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 收藏的短语 ID 列表（从 LocalStorage 加载）
   */
  const [favoritePhraseIds, setFavoritePhraseIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('favorite_phrases');
      const savedIds = saved ? JSON.parse(saved) : [];
      // 收藏顺序列表（用于按时间排序）
      const order = localStorage.getItem('favorite_phrases_order');
      const orderList = order ? JSON.parse(order) : [];
      // 返回 Set 用于快速查找，同时保留顺序信息
      return new Set(savedIds);
    } catch {
      return new Set();
    }
  });

  /**
   * 收藏的短语顺序列表（最新收藏的在前面）
   */
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
   * 快捷短语列表
   * 从收藏的短语中加载，最新收藏的在前面
   */
  const quickPhrases = useMemo<Phrase[]>(() => {
    // 如果没有收藏，返回默认短语
    if (favoriteOrder.length === 0) {
      const defaultPhrases = ALL_PHRASES.filter(p =>
        p.id === 'greeting_01' || p.id === 'restaurant_01'
      );
      return defaultPhrases;
    }

    // 按照收藏顺序加载短语（最新的在前面）
    const phrases: Phrase[] = [];
    for (const id of favoriteOrder) {
      const phrase = ALL_PHRASES.find(p => p.id === id);
      if (phrase) {
        phrases.push(phrase);
      }
    }

    return phrases;
  }, [favoriteOrder]);

  // ===== 核心操作 =====

  /**
   * 显示 Toast 提示
   */
  const showToast = useCallback((message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, TOAST_DURATION);
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
   * 执行翻译
   */
  const performTranslate = useCallback((text: string) => {
    if (text.trim()) {
      translate(text);
    }
  }, [translate]);

  /**
   * 处理文本输入
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSourceText(value);
    clearError();

    // 清空本地状态（因为新的翻译会覆盖它们）
    setLocalTargetText('');
    setLocalRomanization('');
  }, [clearError, setSourceText]);

  /**
   * 处理键盘事件（Enter 键触发翻译）
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 检测 Enter 键（但不包括 Shift+Enter，允许换行）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      performTranslate(inputValue);
    }
  }, [inputValue, performTranslate]);

  /**
   * 处理失去焦点事件（触发翻译）
   */
  const handleBlur = useCallback(() => {
    performTranslate(inputValue);
  }, [inputValue, performTranslate]);

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
    // 清空本地状态（因为 swapLanguages 会处理）
    setLocalTargetText('');
    setLocalRomanization('');
  }, [swapLanguages, targetText]);

  /**
   * 使用快捷短语（直接发音并放入输入框）
   */
  const handleQuickPhrase = useCallback(async (phrase: Phrase) => {
    // 将文本放入输入框
    setInputValue(phrase.zh);
    setSourceText(phrase.zh);

    // 清空本地状态
    setLocalTargetText('');
    setLocalRomanization('');

    // 直接播放韩语发音（使用短语库中的韩文）
    if (!isSpeechSynthesisSupported()) {
      showToast('您的浏览器不支持语音播放');
      return;
    }

    if (isPlaying) {
      return; // 正在播放中，不打断
    }

    setIsPlaying(true);
    try {
      // 直接使用短语库中的韩文发音
      await speak(phrase.ko, 'ko');
    } catch (error) {
      console.error('播放失败:', error);
      showToast('播放失败');
    } finally {
      setIsPlaying(false);
    }

    // 同时翻译文本（在后台进行）
    translate(phrase.zh);
  }, [translate, isPlaying, showToast]);

  /**
   * 麦克风按钮点击处理
   */
  const handleMicClick = useCallback(() => {
    // 检查浏览器支持
    if (!isSupported) {
      showToast('您的浏览器不支持语音识别功能，请使用 Chrome、Edge 或 Safari 浏览器');
      return;
    }

    // 检查是否有语音识别错误
    if (speechError) {
      showToast(speechError);
      return;
    }

    if (isListening) {
      // 停止录音
      stopListening();
    } else {
      // 固定使用中文模式识别语音，让 DeepSeek 自动检测语言
      startListening('zh');
    }
  }, [isListening, isSupported, speechError, startListening, stopListening, showToast]);

  /**
   * Scan 按钮点击处理
   */
  const handleScanClick = useCallback(() => {
    // 触发文件选择器
    fileInputRef.current?.click();
  }, []);

  /**
   * 图片上传处理
   */
  const handleImageUpload = useCallback(async (file: File) => {
    // 防止重复触发
    if (isProcessingImage) {
      return;
    }

    try {
      setIsProcessingImage(true);
      setOcrProgress(0);

      // 提取文字
      const text = await extractText(file, (progress) => {
        setOcrProgress(progress);
      });

      // 检查识别结果
      if (!text || text.trim().length === 0) {
        showToast('未能识别出文字，请重试');
        return;
      }

      // 设置输入值并翻译
      setInputValue(text);
      setSourceText(text);

      // 清空本地状态
      setLocalTargetText('');
      setLocalRomanization('');

      // 自动翻译
      await translate(text);

      showToast('识别成功');
    } catch (error) {
      console.error('OCR 识别失败:', error);
      const errorMessage = getOCRErrorMessage(error);
      showToast(errorMessage);
    } finally {
      setIsProcessingImage(false);
      setOcrProgress(0);

      // 清空文件输入，允许重新选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isProcessingImage, setSourceText, translate, showToast]);

  // ===== Modal 回调函数 =====

  /**
   * 处理快捷短语选择（直接发音并放入输入框）
   */
  const handlePhraseSelect = useCallback(async (phrase: string) => {
    // 从短语库中查找对应的短语
    const phraseObj = ALL_PHRASES.find(p => p.zh === phrase);
    if (!phraseObj) {
      showToast('短语不存在');
      return;
    }

    // 将文本放入输入框
    setInputValue(phrase);
    setSourceText(phrase);

    // 清空本地状态
    setLocalTargetText('');
    setLocalRomanization('');

    // 直接播放韩语发音（使用短语库中的韩文）
    if (!isSpeechSynthesisSupported()) {
      showToast('您的浏览器不支持语音播放');
      return;
    }

    if (isPlaying) {
      return; // 正在播放中，不打断
    }

    setIsPlaying(true);
    try {
      // 直接使用短语库中的韩文发音
      await speak(phraseObj.ko, 'ko');
    } catch (error) {
      console.error('播放失败:', error);
      showToast('播放失败');
    } finally {
      setIsPlaying(false);
    }

    // 同时翻译文本（在后台进行）
    translate(phrase);
  }, [translate, isPlaying, showToast]);

  /**
   * 处理收藏状态变化（重新加载收藏列表）
   */
  const handleFavoriteChange = useCallback(() => {
    // 重新加载收藏顺序
    try {
      const order = localStorage.getItem('favorite_phrases_order');
      const orderList = order ? JSON.parse(order) : [];
      setFavoriteOrder(orderList);

      // 重新加载收藏 ID 集合
      const saved = localStorage.getItem('favorite_phrases');
      const savedIds = saved ? JSON.parse(saved) : [];
      setFavoritePhraseIds(new Set(savedIds));
    } catch (error) {
      console.error('重新加载收藏失败:', error);
    }
  }, []);

  /**
   * 处理历史记录选择
   */
  const handleHistorySelect = useCallback((item: TranslationHistory) => {
    setSourceText(item.sourceText);
    setInputValue(item.sourceText);
    setLocalTargetText(item.targetText);
    setLocalRomanization(item.romanization || '');
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setIsHistoryOpen(false);
  }, [setSourceText, setSourceLang, setTargetLang]);

  /**
   * 处理删除历史记录
   */
  const handleDeleteHistoryItem = useCallback((id: string) => {
    deleteHistoryItem(id);
    showToast('已删除该条记录');
  }, [deleteHistoryItem, showToast]);

  /**
   * 处理清空历史
   */
  const handleClearHistory = useCallback(() => {
    clearHistory();
    showToast('已清空所有历史记录');
    setIsHistoryOpen(false);
  }, [clearHistory, showToast]);

  // ===== 渲染辅助函数 =====

  /**
   * 渲染加载状态
   */
  const renderLoading = () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="w-12 h-12 border-4 border-[#0EA5E9] border-t-transparent rounded-full"
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
          className="text-xs font-bold text-[#0EA5E9] hover:underline"
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
        <div className="text-3xl sm:text-4xl font-extrabold text-[#0369A1] mb-2 tracking-tight">
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
            className="w-11 h-11 bg-[#0EA5E9] rounded-full flex items-center justify-center text-white shadow-glow-primary active:scale-95 transition-transform disabled:opacity-50"
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
      {/* 语音输入指示器（覆盖层） */}
      <VoiceInputIndicator
        isListening={isListening}
        interimTranscript={interimTranscript}
        onStop={stopListening}
      />

      {/* Card Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] bg-clip-text text-transparent">
          Road to Freedom
        </h2>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 px-2">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#0EA5E9] tracking-[0.2em] uppercase mb-1">
            TRAVEL ASSISTANT
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D3436] tracking-tight">
            Translation
          </h2>
        </div>
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="w-12 h-12 bg-white rounded-full shadow-soft-out-sm flex items-center justify-center text-[#636E72] active:shadow-soft-in transition-all"
          title="查看历史记录"
        >
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
          <span
            onClick={() => setIsQuickPhrasesOpen(true)}
            className="text-[11px] font-bold text-[#0EA5E9] cursor-pointer hover:underline"
          >
            View All
          </span>
        </div>
        <div className="flex gap-3 px-1 overflow-x-auto pb-2 scrollbar-hide pt-2">
          {/* 动态渲染快捷短语 */}
          {quickPhrases.map((phrase) => (
            <motion.div
              key={phrase.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickPhrase(phrase)}
              className="bg-white/90 rounded-[2.5rem] p-3 flex items-center flex-shrink-0 min-w-[140px] border border-white cursor-pointer"
            >
              <div className="text-[#0EA5E9] text-[10px] mr-2.5">▶</div>
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
            className="w-10 h-10 bg-[#0EA5E9] rounded-full shadow-glow-primary flex items-center justify-center text-white cursor-pointer"
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
        <div className="bg-white rounded-[3rem] p-4 sm:p-5 shadow-soft-out-sm relative min-h-[100px]">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="请输入要翻译的文本"
            className="w-full h-full resize-none bg-transparent text-xl sm:text-2xl font-extrabold text-[#2D3436] leading-snug focus:outline-none placeholder:text-[#CBD5E1]"
            rows={2}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Result Card */}
      <div className="px-1 mb-4 flex-1">
        <div className="bg-white/90 rounded-[3rem] p-4 sm:p-5 shadow-soft-out-lg border border-white h-full">
          {renderResult()}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-center px-6 pb-4">
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMicClick}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-soft-out-sm transition-all duration-200 ${
              isListening
                ? 'bg-gradient-to-tr from-[#E74C3C] to-[#C0392B] shadow-glow-error'
                : 'bg-gradient-to-tr from-[#0EA5E9] to-[#38BDF8] shadow-glow-primary'
            }`}
          >
            {isListening ? (
              // 停止图标
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              // 麦克风图标
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}

            {/* 录音时的脉冲动画 */}
            {isListening && (
              <>
                <motion.span
                  className="absolute inset-0 rounded-full bg-[#E74C3C]/30"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full bg-[#E74C3C]/20"
                  animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
              </>
            )}
          </motion.button>
        </div>

        {/* Scan 按钮 */}
        <motion.div
          className="flex flex-col items-center gap-1.5 cursor-pointer group"
          whileTap={{ scale: 0.95 }}
          onClick={handleScanClick}
        >
          <div className="w-12 h-12 bg-white rounded-2xl shadow-soft-out-sm flex items-center justify-center text-[#94A3B8] border border-gray-50 group-active:shadow-soft-in">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Scan</span>
        </motion.div>
      </div>

      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
          }
        }}
      />

      {/* OCR 识别进度条 */}
      {isProcessingImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[3.5rem] flex flex-col items-center justify-center z-40"
        >
          <div className="flex flex-col items-center gap-4 px-8">
            {/* 旋转的扫描图标 */}
            <motion.div
              className="w-20 h-20 bg-gradient-to-tr from-[#0EA5E9] to-[#38BDF8] rounded-full flex items-center justify-center shadow-glow-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </motion.div>

            {/* 进度文字 */}
            <div className="text-center">
              <div className="text-2xl font-bold text-[#2D3436] mb-1">
                识别中...
              </div>
              <div className="text-sm font-medium text-[#94A3B8]">
                {ocrProgress}%
              </div>
            </div>

            {/* 进度条 */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8]"
                initial={{ width: 0 }}
                animate={{ width: `${ocrProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* 提示文字 */}
            <div className="text-xs text-[#CBD5E1] text-center max-w-xs">
              请稍候，正在从图片中提取文字...
            </div>
          </div>
        </motion.div>
      )}

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

      {/* 快捷短语弹窗 */}
      <QuickPhrasesModal
        isOpen={isQuickPhrasesOpen}
        onClose={() => setIsQuickPhrasesOpen(false)}
        onPhraseSelect={handlePhraseSelect}
        showToast={showToast}
        onFavoriteChange={handleFavoriteChange}
      />

      {/* 翻译历史弹窗 */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
        onSelectHistory={handleHistorySelect}
      />
    </div>
  );
}
