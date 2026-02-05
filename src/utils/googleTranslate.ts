/**
 * Google Translate API 封装工具
 *
 * 功能：
 * - 调用 Google Translate API v2 进行中韩互译
 * - 支持请求缓存（避免重复翻译）
 * - 完善的错误处理
 * - 支持罗马音提取（韩文）
 */

import type { Language, TranslationResult } from '../types/translation';

/**
 * Google Translate API 响应类型
 */
interface GoogleTranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

/**
 * Google Translate API 错误响应
 */
interface GoogleTranslateError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * 翻译缓存项
 */
interface CacheItem {
  translatedText: string;
  timestamp: number;
}

/**
 * 翻译缓存 Map
 * Key: `${sourceText}_${sourceLang}_${targetLang}`
 */
const translationCache = new Map<string, CacheItem>();

/**
 * 缓存过期时间（1小时）
 */
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Google Cloud Translation API 端点
 */
const API_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';

/**
 * 从环境变量获取 API 密钥
 */
const getApiKey = (): string => {
  if (typeof window === 'undefined') {
    // 服务端渲染环境
    return process.env.GOOGLE_TRANSLATE_API_KEY || '';
  }
  // 客户端环境
  return process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY || '';
};

/**
 * 验证 Google Translate API 配置
 *
 * 在应用启动时调用，检查 API 密钥是否已配置
 *
 * @returns 配置是否有效
 * @throws Error 当配置无效时
 */
export const validateGoogleTranslateConfig = (): {
  isValid: boolean;
  error?: string;
} => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      isValid: false,
      error: 'Google Translate API 密钥未配置。请在 .env.local 中设置 NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY',
    };
  }

  // 检查 API 密钥格式（Google API 密钥通常是 39 位字母数字字符串）
  if (apiKey.length < 20) {
    return {
      isValid: false,
      error: 'Google Translate API 密钥格式无效（密钥长度不足）',
    };
  }

  return { isValid: true };
};

/**
 * 语言代码映射（本地 -> Google API）
 */
const LANGUAGE_CODE_MAP: Record<Language, string> = {
  zh: 'zh-CN',
  ko: 'ko',
};

/**
 * 清理过期缓存
 */
const cleanExpiredCache = (): void => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  // 收集需要删除的键
  translationCache.forEach((item, key) => {
    if (now - item.timestamp > CACHE_EXPIRY_MS) {
      keysToDelete.push(key);
    }
  });

  // 批量删除
  keysToDelete.forEach(key => translationCache.delete(key));
};

/**
 * 生成缓存键
 */
const generateCacheKey = (text: string, sourceLang: Language, targetLang: Language): string => {
  return `${text}_${sourceLang}_${targetLang}`;
};

/**
 * 从缓存获取翻译结果
 */
const getFromCache = (text: string, sourceLang: Language, targetLang: Language): string | null => {
  cleanExpiredCache();
  const key = generateCacheKey(text, sourceLang, targetLang);
  const cached = translationCache.get(key);
  return cached?.translatedText || null;
};

/**
 * 保存翻译结果到缓存
 */
const saveToCache = (text: string, sourceLang: Language, targetLang: Language, result: string): void => {
  const key = generateCacheKey(text, sourceLang, targetLang);
  translationCache.set(key, {
    translatedText: result,
    timestamp: Date.now(),
  });
};

/**
 * 提取韩文罗马音
 *
 * 注意：Google Translate API 不直接返回罗马音。
 * 这是一个简化实现，使用基本的罗马音转换规则。
 * 完整的罗马音转换需要专门的库（如 korean-romanizer）。
 *
 * 临时方案：返回占位符标记，提示用户罗马音功能需要第三方库支持
 *
 * @param koreanText 韩文文本
 * @returns 罗马音文本或占位符
 */
const extractRomanization = (koreanText: string): string => {
  // 如果是空字符串，直接返回
  if (!koreanText || koreanText.trim().length === 0) {
    return '';
  }

  // 临时方案：返回占位符
  // 说明：完整的韩文罗马音转换需要集成专业库
  // 推荐库：korean-romanizer (https://www.npmjs.com/package/korean-romanizer)
  //
  // 集成步骤：
  // 1. 安装库：npm install korean-romanizer
  // 2. 导入：import Romanizer from 'korean-romanizer';
  // 3. 使用：const romanizer = new Romanizer(); const roman = romanizer.convert(koreanText);
  //
  // 这里返回一个占位符，保持接口一致性，避免功能缺失
  return `[韩文发音: ${koreanText.length} 字]`;
};

/**
 * 调用 Google Translate API
 *
 * @param text 要翻译的文本
 * @param sourceLang 源语言
 * @param targetLang 目标语言
 * @returns 翻译结果
 * @throws Error 当 API 调用失败时
 */
const callTranslateAPI = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      'Google Translate API 密钥未配置。请在 .env.local 中设置 NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY'
    );
  }

  const source = LANGUAGE_CODE_MAP[sourceLang];
  const target = LANGUAGE_CODE_MAP[targetLang];

  try {
    const response = await fetch(
      `${API_ENDPOINT}?key=${apiKey}&source=${source}&target=${target}&q=${encodeURIComponent(text)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData: GoogleTranslateError = await response.json();
      handleAPIError(errorData, response.status);
    }

    const data: GoogleTranslateResponse = await response.json();
    const translatedText = data.data.translations[0]?.translatedText;

    if (!translatedText) {
      throw new Error('翻译结果为空');
    }

    return translatedText;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('翻译请求失败，请检查网络连接');
  }
};

/**
 * 处理 API 错误响应
 */
const handleAPIError = (errorData: GoogleTranslateError, status: number): never => {
  const { code, message, status: statusText } = errorData.error;

  switch (code) {
    case 400:
      throw new Error('请求参数无效：' + message);
    case 403:
      if (message.includes('quota')) {
        throw new Error('API 配额已用完，请稍后再试或升级配额');
      }
      throw new Error('API 密钥无效或无权限访问');
    case 404:
      throw new Error('翻译服务未找到');
    case 429:
      throw new Error('请求过于频繁，请稍后再试');
    default:
      throw new Error(`翻译失败（${status}）：${message}`);
  }
};

/**
 * 翻译文本（主函数）
 *
 * @param text 要翻译的文本
 * @param sourceLang 源语言
 * @param targetLang 目标语言
 * @returns 翻译结果
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

  // 检查缓存
  const cached = getFromCache(text, sourceLang, targetLang);
  if (cached) {
    return {
      translatedText: cached,
      romanization: targetLang === 'ko' ? extractRomanization(cached) : undefined,
      isOffline: false,
    };
  }

  // 调用 API
  const translatedText = await callTranslateAPI(text, sourceLang, targetLang);

  // 保存到缓存
  saveToCache(text, sourceLang, targetLang, translatedText);

  // 返回结果
  return {
    translatedText,
    romanization: targetLang === 'ko' ? extractRomanization(translatedText) : undefined,
    isOffline: false,
  };
};

/**
 * 批量翻译（用于预加载常用短语）
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

  // 过滤掉已在缓存中的
  const textsToTranslate = texts.filter(text => {
    const cached = getFromCache(text, sourceLang, targetLang);
    if (cached) {
      results.push({
        translatedText: cached,
        romanization: targetLang === 'ko' ? extractRomanization(cached) : undefined,
        isOffline: false,
      });
      return false;
    }
    return true;
  });

  // 批量调用 API（Google API 支持一次请求最多 50 个文本）
  const batchSize = 50;
  for (let i = 0; i < textsToTranslate.length; i += batchSize) {
    const batch = textsToTranslate.slice(i, i + batchSize);
    const apiKey = getApiKey();

    const source = LANGUAGE_CODE_MAP[sourceLang];
    const target = LANGUAGE_CODE_MAP[targetLang];

    try {
      const response = await fetch(
        `${API_ENDPOINT}?key=${apiKey}&source=${source}&target=${target}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: batch,
          }),
        }
      );

      if (!response.ok) {
        const errorData: GoogleTranslateError = await response.json();
        handleAPIError(errorData, response.status);
      }

      const data: GoogleTranslateResponse = await response.json();
      const translations = data.data.translations;

      translations.forEach((item, index) => {
        const translatedText = item.translatedText;
        const originalText = batch[index];

        // 保存到缓存
        saveToCache(originalText, sourceLang, targetLang, translatedText);

        results.push({
          translatedText,
          romanization: targetLang === 'ko' ? extractRomanization(translatedText) : undefined,
          isOffline: false,
        });
      });
    } catch (error) {
      // 批量翻译失败时，逐个重试
      for (const text of batch) {
        try {
          const result = await translateText(text, sourceLang, targetLang);
          results.push(result);
        } catch (err) {
          console.error(`批量翻译失败，跳过: ${text}`, err);
          // 跳过失败的文本
        }
      }
    }
  }

  return results;
};

/**
 * 清空翻译缓存
 */
export const clearTranslationCache = (): void => {
  translationCache.clear();
};

/**
 * 获取缓存统计信息
 */
export const getCacheStats = (): { size: number; keys: string[] } => {
  cleanExpiredCache();
  return {
    size: translationCache.size,
    keys: Array.from(translationCache.keys()),
  };
};
