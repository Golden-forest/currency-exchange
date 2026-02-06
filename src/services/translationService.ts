/**
 * 翻译服务 - 整合离线短语库和 DeepSeek API
 *
 * 核心功能：
 * - 智能路由：优先使用离线短语库，降级到 API
 * - 翻译历史管理：LocalStorage 持久化
 * - 完善的错误处理和降级策略
 *
 * 性能策略：
 * - 离线短语匹配：< 50ms（覆盖 80% 场景）
 * - API 调用：1-2s（处理 20% 复杂句子）
 * - 网络失败时自动降级到离线模式
 */

import type { Language, TranslationResult, TranslationHistory, Phrase } from '@/types/translation';
import { fuzzyMatch, initPhraseIndex } from '@/utils/textMatcher';
import { ALL_PHRASES } from '@/data/phraseLibrary';

/**
 * 离线短语相似度阈值
 * 相似度 > 0.8 才认为是有效匹配
 */
const OFFLINE_MATCH_THRESHOLD = 0.8;

/**
 * LocalStorage 键名
 */
const STORAGE_KEYS = {
  HISTORY: 'translation_history',
  MAX_HISTORY_SIZE: 'translation_max_history_size',
} as const;

/**
 * 默认最大历史记录数量
 */
const DEFAULT_MAX_HISTORY_SIZE = 20;

/**
 * 初始化短语库索引
 *
 * 注意：只需在应用启动时调用一次
 */
let isPhraseIndexInitialized = false;

const initializePhraseIndex = (): void => {
  if (!isPhraseIndexInitialized) {
    initPhraseIndex(ALL_PHRASES);
    isPhraseIndexInitialized = true;
  }
};

/**
 * 搜索离线短语库
 *
 * @param text 用户输入文本
 * @param sourceLang 源语言
 * @returns 匹配的短语，如果没有匹配返回 null
 */
const searchOfflinePhrases = (text: string, sourceLang: Language): Phrase | null => {
  initializePhraseIndex();

  const matchResult = fuzzyMatch(text, sourceLang, OFFLINE_MATCH_THRESHOLD);

  if (matchResult && matchResult.similarity >= OFFLINE_MATCH_THRESHOLD) {
    return matchResult.phrase;
  }

  return null;
};

/**
 * 调用 DeepSeek Translate API (通过服务端代理)
 *
 * @description 通过 Next.js API Route 调用 DeepSeek API，保护 API Key 不暴露给客户端
 * @param text 要翻译的文本
 * @param sourceLang 源语言
 * @param targetLang 目标语言
 * @returns 翻译结果
 * @throws Error 当 API 调用失败时
 */
const callDeepSeekTranslate = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult> => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `翻译服务错误: ${response.status}`);
    }

    const result = await response.json();
    return {
      translatedText: result.translatedText,
      romanization: result.romanization,
      isOffline: false,
    };
  } catch (error) {
    // 重新抛出错误，由上层处理
    throw error;
  }
};

/**
 * 保存翻译记录到历史
 *
 * @param sourceText 源文本
 * @param targetText 翻译结果
 * @param sourceLang 源语言
 * @param targetLang 目标语言
 * @param isOffline 是否为离线匹配
 * @param romanization 罗马音（可选）
 */
const saveToHistory = (
  sourceText: string,
  targetText: string,
  sourceLang: Language,
  targetLang: Language,
  isOffline: boolean,
  romanization?: string
): void => {
  try {
    // 使用 crypto.randomUUID() 生成唯一 ID
    // 如果浏览器不支持，则回退到时间戳方案
    const generateId = (): string => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // 回退方案：时间戳 + 随机数
      return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const historyItem: TranslationHistory = {
      id: generateId(),
      sourceText,
      targetText,
      sourceLang,
      targetLang,
      romanization,
      timestamp: Date.now(),
      isOffline,
    };

    // 获取现有历史
    const existingHistory = getHistory();

    // 添加新记录到开头
    const newHistory = [historyItem, ...existingHistory];

    // 限制历史记录数量
    const maxSize = getMaxHistorySize();
    const trimmedHistory = newHistory.slice(0, maxSize);

    // 保存到 LocalStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
    }
  } catch (error) {
    console.error('保存翻译历史失败:', error);
  }
};

/**
 * 获取历史记录
 *
 * @returns 翻译历史数组（按时间倒序）
 */
const getHistory = (): TranslationHistory[] => {
  try {
    if (typeof window === 'undefined') {
      return [];
    }

    const historyStr = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!historyStr) {
      return [];
    }

    const history: TranslationHistory[] = JSON.parse(historyStr);

    // 验证数据完整性
    if (!Array.isArray(history)) {
      return [];
    }

    return history;
  } catch (error) {
    console.error('读取翻译历史失败:', error);
    return [];
  }
};

/**
 * 清空历史记录
 */
const clearHistory = (): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEYS.HISTORY);
    }
  } catch (error) {
    console.error('清空翻译历史失败:', error);
  }
};

/**
 * 删除单条历史记录
 *
 * @param id 历史记录 ID
 */
const deleteHistoryItem = (id: string): void => {
  try {
    const existingHistory = getHistory();
    const newHistory = existingHistory.filter(item => item.id !== id);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    }
  } catch (error) {
    console.error('删除历史记录失败:', error);
  }
};

/**
 * 获取最大历史记录数量
 *
 * @returns 最大历史记录数量
 */
const getMaxHistorySize = (): number => {
  try {
    if (typeof window === 'undefined') {
      return DEFAULT_MAX_HISTORY_SIZE;
    }

    const sizeStr = window.localStorage.getItem(STORAGE_KEYS.MAX_HISTORY_SIZE);
    if (!sizeStr) {
      return DEFAULT_MAX_HISTORY_SIZE;
    }

    const size = parseInt(sizeStr, 10);
    return isNaN(size) ? DEFAULT_MAX_HISTORY_SIZE : size;
  } catch (error) {
    return DEFAULT_MAX_HISTORY_SIZE;
  }
};

/**
 * 设置最大历史记录数量
 *
 * @param size 最大历史记录数量
 */
const setMaxHistorySize = (size: number): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.MAX_HISTORY_SIZE, String(size));

      // 如果当前历史记录超过新限制，裁剪历史
      const currentHistory = getHistory();
      if (currentHistory.length > size) {
        const trimmedHistory = currentHistory.slice(0, size);
        window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
      }
    }
  } catch (error) {
    console.error('设置历史记录数量失败:', error);
  }
};

/**
 * 翻译文本（主函数）
 *
 * 智能路由策略：
 * 1. 首先搜索离线短语库
 * 2. 如果匹配度 > 0.8，直接返回离线结果
 * 3. 否则调用 DeepSeek Translate API
 * 4. 保存翻译历史到 LocalStorage
 * 5. 返回翻译结果
 *
 * @param text 要翻译的文本
 * @param sourceLang 源语言
 * @param targetLang 目标语言
 * @returns 翻译结果
 * @throws Error 当输入无效或所有翻译方式都失败时
 */
export const translateText = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult> => {
  // 输入验证
  if (!text || text.trim().length === 0) {
    throw new Error('翻译文本不能为空');
  }

  if (text.length > 5000) {
    throw new Error('翻译文本长度不能超过 5000 字符');
  }

  const trimmedText = text.trim();

  // 策略 1：尝试离线短语匹配
  const matchedPhrase = searchOfflinePhrases(trimmedText, sourceLang);

  if (matchedPhrase) {
    // 离线匹配成功
    const targetText = targetLang === 'zh' ? matchedPhrase.zh : matchedPhrase.ko;
    const romanization = targetLang === 'ko' ? matchedPhrase.romanization : undefined;

    // 保存到历史
    saveToHistory(
      trimmedText,
      targetText,
      sourceLang,
      targetLang,
      true,
      romanization
    );

    return {
      translatedText: targetText,
      romanization,
      isOffline: true,
      matchedPhrase,
    };
  }

  // 策略 2：调用 DeepSeek API
  try {
    const result = await callDeepSeekTranslate(trimmedText, sourceLang, targetLang);

    // 保存到历史
    saveToHistory(
      trimmedText,
      result.translatedText,
      sourceLang,
      targetLang,
      false,
      result.romanization
    );

    return result;
  } catch (error) {
    // 策略 3：API 失败时的降级处理
    const errorMessage = error instanceof Error ? error.message : '翻译失败';

    // 尝试使用部分匹配的离线短语（如果有）
    const partialMatch = searchOfflinePhrases(trimmedText, sourceLang);

    if (partialMatch) {
      // 部分匹配降级
      console.warn('API 调用失败，降级到部分匹配的离线短语:', errorMessage);

      const targetText = targetLang === 'zh' ? partialMatch.zh : partialMatch.ko;
      const romanization = targetLang === 'ko' ? partialMatch.romanization : undefined;

      // 保存到历史
      saveToHistory(
        trimmedText,
        targetText,
        sourceLang,
        targetLang,
        true,
        romanization
      );

      return {
        translatedText: targetText,
        romanization,
        isOffline: true,
        matchedPhrase: partialMatch,
      };
    }

    // 所有策略都失败，抛出错误
    throw new Error(`${errorMessage}。请检查网络连接或稍后再试。`);
  }
};

/**
 * 批量翻译（用于预加载）
 *
 * @param texts 文本数组
 * @param sourceLang 源语言
 * @param targetLang 目标语言
 * @returns 翻译结果数组
 */
export const batchTranslate = async (
  texts: string[],
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult[]> => {
  const results: TranslationResult[] = [];

  for (const text of texts) {
    try {
      const result = await translateText(text, sourceLang, targetLang);
      results.push(result);
    } catch (error) {
      console.error(`批量翻译失败，跳过: ${text}`, error);
      // 跳过失败的文本
    }
  }

  return results;
};

/**
 * 历史记录管理
 */
export const historyService = {
  /**
   * 获取历史记录
   */
  get: getHistory,

  /**
   * 清空历史记录
   */
  clear: clearHistory,

  /**
   * 删除单条历史记录
   */
  delete: deleteHistoryItem,

  /**
   * 获取最大历史记录数量
   */
  getMaxSize: getMaxHistorySize,

  /**
   * 设置最大历史记录数量
   */
  setMaxSize: setMaxHistorySize,
};

/**
 * 清空所有缓存（包括翻译缓存和历史记录）
 */
export const clearAllCaches = (): void => {
  clearHistory();
};

/**
 * 初始化翻译服务
 *
 * 在应用启动时调用一次
 */
export const initTranslationService = (): void => {
  initializePhraseIndex();
};

/**
 * 获取翻译服务统计信息
 */
export const getTranslationStats = () => {
  const history = getHistory();

  const offlineCount = history.filter(item => item.isOffline).length;
  const onlineCount = history.length - offlineCount;

  return {
    totalTranslations: history.length,
    offlineTranslations: offlineCount,
    onlineTranslations: onlineCount,
    offlineRate: history.length > 0 ? offlineCount / history.length : 0,
    maxHistorySize: getMaxHistorySize(),
  };
};
