/**
 * 翻译功能 Hook
 *
 * 封装翻译逻辑，提供状态管理和操作函数
 * - 管理翻译状态（源文本、目标文本、语言等）
 * - 提供翻译、交换语言、历史记录管理等功能
 * - 集成 LocalStorage 持久化
 * - 完善的错误处理和加载状态管理
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Language, TranslationHistory, TranslationResult } from '@/types/translation';
import {
  translateText as serviceTranslate,
  historyService,
  initTranslationService,
  getTranslationStats,
} from '@/services/translationService';

/**
 * Hook 返回值接口
 */
export interface UseTranslationReturn {
  // 状态
  /** 源文本 */
  sourceText: string;
  /** 设置源文本 */
  setSourceText: (text: string) => void;
  /** 翻译结果 */
  targetText: string;
  /** 源语言 */
  sourceLang: Language;
  /** 设置源语言 */
  setSourceLang: (lang: Language) => void;
  /** 目标语言 */
  targetLang: Language;
  /** 设置目标语言 */
  setTargetLang: (lang: Language) => void;
  /** 罗马音（韩文发音） */
  romanization: string;
  /** 是否正在翻译 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 翻译历史 */
  history: TranslationHistory[];

  // 操作
  /** 翻译文本 */
  translate: (text?: string) => Promise<void>;
  /** 交换源语言和目标语言 */
  swapLanguages: () => void;
  /** 清空历史记录 */
  clearHistory: () => void;
  /** 删除单条历史记录 */
  deleteHistoryItem: (id: string) => void;
  /** 清除错误 */
  clearError: () => void;
}

/**
 * 翻译 Hook 配置选项
 */
interface UseTranslationOptions {
  /** 初始源语言（默认：中文） */
  initialSourceLang?: Language;
  /** 初始目标语言（默认：韩文） */
  initialTargetLang?: Language;
  /** 是否自动加载历史记录（默认：true） */
  loadHistory?: boolean;
}

/**
 * 翻译 Hook
 *
 * @param options 配置选项
 * @returns 翻译状态和操作函数
 *
 * @example
 * ```tsx
 * const {
 *   sourceText,
 *   setSourceText,
 *   targetText,
 *   sourceLang,
 *   targetLang,
 *   isLoading,
 *   error,
 *   history,
 *   translate,
 *   swapLanguages,
 *   clearHistory,
 * } = useTranslation({
 *   initialSourceLang: 'zh',
 *   initialTargetLang: 'ko',
 * });
 * ```
 */
export const useTranslation = (options: UseTranslationOptions = {}): UseTranslationReturn => {
  const {
    initialSourceLang = 'zh',
    initialTargetLang = 'ko',
    loadHistory = true,
  } = options;

  // ===== 状态管理 =====

  /** 源文本 */
  const [sourceText, setSourceText] = useState<string>('');

  /** 翻译结果 */
  const [targetText, setTargetText] = useState<string>('');

  /** 罗马音（韩文发音） */
  const [romanization, setRomanization] = useState<string>('');

  /** 源语言 */
  const [sourceLang, setSourceLang] = useState<Language>(initialSourceLang);

  /** 目标语言 */
  const [targetLang, setTargetLang] = useState<Language>(initialTargetLang);

  /** 加载状态 */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** 错误状态 */
  const [error, setError] = useState<string | null>(null);

  /** 翻译历史 */
  const [history, setHistory] = useState<TranslationHistory[]>([]);

  // ===== 初始化 =====

  /**
   * 初始化翻译服务
   */
  useEffect(() => {
    initTranslationService();
  }, []);

  /**
   * 加载历史记录
   */
  useEffect(() => {
    if (loadHistory) {
      const loadedHistory = historyService.get();
      setHistory(loadedHistory);
    }
  }, [loadHistory]);

  // ===== 核心操作 =====

  /**
   * 翻译文本
   *
   * @param text 要翻译的文本（可选，默认使用 sourceText）
   */
  const translate = useCallback(async (text?: string): Promise<void> => {
    const textToTranslate = text || sourceText;

    // 输入验证
    if (!textToTranslate || textToTranslate.trim().length === 0) {
      setError('请输入要翻译的文本');
      return;
    }

    // 清除之前的错误
    setError(null);

    // 开始加载
    setIsLoading(true);

    try {
      // 调用翻译服务
      const result: TranslationResult = await serviceTranslate(
        textToTranslate,
        sourceLang,
        targetLang
      );

      // 更新状态
      setTargetText(result.translatedText);
      setRomanization(result.romanization || '');

      // 如果是外部调用传入的 text，也更新 sourceText
      if (text !== undefined && text !== sourceText) {
        setSourceText(text);
      }

      // 刷新历史记录
      const updatedHistory = historyService.get();
      setHistory(updatedHistory);
    } catch (err) {
      // 错误处理
      const errorMessage = err instanceof Error ? err.message : '翻译失败，请稍后再试';
      setError(errorMessage);
      console.error('翻译错误:', err);
    } finally {
      // 结束加载
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  /**
   * 交换源语言和目标语言
   *
   * 行为：
   * - 交换 sourceLang 和 targetLang
   * - 如果有翻译结果，也交换显示
   */
  const swapLanguages = useCallback((): void => {
    // 保存当前状态
    const newSourceLang = targetLang;
    const newTargetLang = sourceLang;
    const newSourceText = targetText;
    const newTargetText = sourceText;

    // 交换语言
    setSourceLang(newSourceLang);
    setTargetLang(newTargetLang);

    // 如果有翻译结果，交换显示
    if (targetText) {
      setSourceText(newSourceText);
      setTargetText(newTargetText);
    } else {
      // 没有翻译结果时，只清空源文本
      setSourceText('');
      setTargetText('');
      setRomanization('');
    }

    // 清除错误
    setError(null);
  }, [sourceLang, targetLang, sourceText, targetText]);

  /**
   * 清空历史记录
   */
  const clearHistory = useCallback((): void => {
    historyService.clear();
    setHistory([]);
  }, []);

  /**
   * 删除单条历史记录
   *
   * @param id 历史记录 ID
   */
  const deleteHistoryItem = useCallback((id: string): void => {
    historyService.delete(id);
    const updatedHistory = historyService.get();
    setHistory(updatedHistory);
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // ===== 返回接口 =====

  return {
    // 状态
    sourceText,
    setSourceText,
    targetText,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    romanization,
    isLoading,
    error,
    history,

    // 操作
    translate,
    swapLanguages,
    clearHistory,
    deleteHistoryItem,
    clearError,
  };
};

/**
 * 翻译历史 Hook（独立 Hook，用于历史记录管理）
 */
export const useTranslationHistory = () => {
  const [history, setHistory] = useState<TranslationHistory[]>([]);

  // 加载历史记录
  useEffect(() => {
    const loadedHistory = historyService.get();
    setHistory(loadedHistory);
  }, []);

  // 刷新历史记录
  const refreshHistory = useCallback(() => {
    const updatedHistory = historyService.get();
    setHistory(updatedHistory);
  }, []);

  return {
    history,
    refreshHistory,
    clearHistory: () => {
      historyService.clear();
      setHistory([]);
    },
    deleteHistoryItem: (id: string) => {
      historyService.delete(id);
      refreshHistory();
    },
    getStats: () => getTranslationStats(),
  };
};

/**
 * 翻译统计 Hook
 */
export const useTranslationStats = () => {
  const [stats, setStats] = useState(() => getTranslationStats());

  const refreshStats = useCallback(() => {
    setStats(getTranslationStats());
  }, []);

  return {
    stats,
    refreshStats,
  };
};
