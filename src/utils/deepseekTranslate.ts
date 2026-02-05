import type { Language, TranslationResult } from '@/types/translation';
import { koreanToRomanization } from './romanizer';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * DeepSeek API 响应类型
 *
 * @description DeepSeek Chat Completions API 的标准响应格式
 */
interface DeepSeekResponse {
  /** 响应唯一标识符 */
  id: string;
  /** 对象类型，固定为 'chat.completion' */
  object: string;
  /** 请求创建时间（Unix 时间戳） */
  created: number;
  /** 使用的模型名称 */
  model: string;
  /** 候选翻译结果列表 */
  choices: Array<{
    /** 候选索引 */
    index: number;
    /** 消息内容 */
    message: {
      /** 消息角色（system/user/assistant） */
      role: string;
      /** 消息文本内容 */
      content: string;
    };
    /** 结束原因（stop/length/content_filter） */
    finish_reason: string;
  }>;
  /** Token 使用统计 */
  usage: {
    /** 输入 Token 数量 */
    prompt_tokens: number;
    /** 输出 Token 数量 */
    completion_tokens: number;
    /** 总 Token 数量 */
    total_tokens: number;
  };
}

/**
 * DeepSeek API 错误响应
 *
 * @description API 调用失败时返回的错误信息
 */
interface DeepSeekError {
  /** 错误详情 */
  error: {
    /** 错误消息 */
    message: string;
    /** 错误类型 */
    type: string;
    /** 可选的错误代码 */
    code?: string;
  };
}

// ============================================================================
// 配置常量
// ============================================================================

/**
 * DeepSeek API 端点
 *
 * @description DeepSeek Chat Completions API 的基础 URL
 */
const API_ENDPOINT = 'https://api.deepseek.com/chat/completions';

/**
 * 系统提示词（翻译角色）
 *
 * @description 定义 AI 翻译助手的角色和规则
 */
const SYSTEM_PROMPT = `你是专业的中韩翻译助手。
规则：
- 只返回翻译结果，不要解释
- 保持原文的语气和礼貌程度
- 对于中文→韩语：使用自然的韩语表达
- 对于韩语→中文：使用地道的中文表达`;

/**
 * 智能重试配置
 *
 * @description 针对不同错误状态码的重试策略
 * - 429: Rate limit（请求过于频繁）
 * - 500: Server error（服务器错误）
 * - timeout: Network timeout（网络超时）
 */
const RETRY_CONFIG: Record<string, { delay: number; maxRetries: number }> = {
  '429': { delay: 2000, maxRetries: 1 },  // Rate limit: 2秒后重试1次
  '500': { delay: 1000, maxRetries: 1 },  // Server error: 1秒后重试1次
  'timeout': { delay: 3000, maxRetries: 1 }, // Network timeout: 3秒后重试1次
};

/**
 * 缓存过期时间（1小时）
 *
 * @description 翻译缓存的存活时间，单位毫秒
 */
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

/**
 * 缓存项
 *
 * @description 单个翻译缓存的数据结构
 */
interface CacheItem {
  /** 翻译结果文本 */
  translatedText: string;
  /** 缓存创建时间（Unix 时间戳） */
  timestamp: number;
}

/**
 * 翻译缓存 Map
 *
 * @description 内存缓存存储，Key 格式: `${sourceText}_${sourceLang}_${targetLang}`
 */
const translationCache = new Map<string, CacheItem>();

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 从环境变量获取 API 密钥
 *
 * @description 支持服务端和客户端环境变量
 * - 服务端: 使用 `DEEPSEEK_API_KEY`
 * - 客户端: 使用 `NEXT_PUBLIC_DEEPSEEK_API_KEY`
 *
 * @returns DeepSeek API 密钥字符串，未配置时返回空字符串
 *
 * @example
 * ```typescript
 * const apiKey = getApiKey();
 * if (!apiKey) {
 *   console.error('API 密钥未配置');
 * }
 * ```
 */
const getApiKey = (): string => {
  if (typeof window === 'undefined') {
    // 服务端环境
    return process.env.DEEPSEEK_API_KEY || '';
  }
  // 客户端环境
  return process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
};

/**
 * 验证 DeepSeek API 配置
 *
 * @description 检查 API 密钥是否已配置且格式正确
 *
 * @returns 配置验证结果，包含是否有效和错误信息
 *
 * @example
 * ```typescript
 * const validation = validateDeepSeekConfig();
 * if (!validation.isValid) {
 *   console.error(validation.error);
 * }
 * ```
 */
export const validateDeepSeekConfig = (): {
  isValid: boolean;
  error?: string;
} => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      isValid: false,
      error: 'DeepSeek API 密钥未配置。请在 .env.local 中设置 NEXT_PUBLIC_DEEPSEEK_API_KEY',
    };
  }

  // DeepSeek API key 通常以 'sk-' 开头
  if (!apiKey.startsWith('sk-')) {
    return {
      isValid: false,
      error: 'DeepSeek API 密钥格式无效（应以 sk- 开头）',
    };
  }

  return { isValid: true };
};

/**
 * 生成缓存键
 *
 * @description 根据源文本和语言方向生成唯一的缓存键
 *
 * @param text - 源文本
 * @param sourceLang - 源语言
 * @param targetLang - 目标语言
 * @returns 缓存键字符串
 *
 * @example
 * ```typescript
 * const key = generateCacheKey('你好', 'zh', 'ko');
 * // '你好_zh_ko'
 * ```
 */
const generateCacheKey = (
  text: string,
  sourceLang: Language,
  targetLang: Language
): string => {
  return `${text}_${sourceLang}_${targetLang}`;
};

/**
 * 清理过期缓存
 *
 * @description 删除所有超过缓存时间的翻译记录
 *
 * @example
 * ```typescript
 * cleanExpiredCache(); // 清理过期的缓存项
 * ```
 */
const cleanExpiredCache = (): void => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  // 查找所有过期的缓存键
  translationCache.forEach((item, key) => {
    if (now - item.timestamp > CACHE_EXPIRY_MS) {
      keysToDelete.push(key);
    }
  });

  // 删除过期缓存
  keysToDelete.forEach((key) => translationCache.delete(key));
};

/**
 * 从缓存获取翻译结果
 *
 * @description 根据源文本和语言方向从缓存中读取翻译结果
 *
 * @param text - 源文本
 * @param sourceLang - 源语言
 * @param targetLang - 目标语言
 * @returns 翻译结果字符串，未命中时返回 null
 *
 * @example
 * ```typescript
 * const cached = getFromCache('你好', 'zh', 'ko');
 * if (cached) {
 *   console.log('命中缓存:', cached);
 * }
 * ```
 */
const getFromCache = (
  text: string,
  sourceLang: Language,
  targetLang: Language
): string | null => {
  // 自动清理过期缓存
  cleanExpiredCache();

  const key = generateCacheKey(text, sourceLang, targetLang);
  const cached = translationCache.get(key);

  return cached?.translatedText || null;
};

/**
 * 保存翻译结果到缓存
 *
 * @description 将翻译结果存储到内存缓存中
 *
 * @param text - 源文本
 * @param sourceLang - 源语言
 * @param targetLang - 目标语言
 * @param result - 翻译结果
 *
 * @example
 * ```typescript
 * saveToCache('你好', 'zh', 'ko', '안녕하세요');
 * ```
 */
const saveToCache = (
  text: string,
  sourceLang: Language,
  targetLang: Language,
  result: string
): void => {
  const key = generateCacheKey(text, sourceLang, targetLang);
  translationCache.set(key, {
    translatedText: result,
    timestamp: Date.now(),
  });
};

// ============================================================================
// 核心 API 调用函数
// ============================================================================

/**
 * 调用 DeepSeek API 进行翻译
 *
 * @description 核心翻译函数，发起 HTTP 请求到 DeepSeek API
 *
 * @param text - 要翻译的文本
 * @param sourceLang - 源语言
 * @param targetLang - 目标语言
 * @returns 翻译结果字符串
 * @throws Error 当 API 调用失败时抛出错误
 *
 * @example
 * ```typescript
 * try {
 *   const result = await callTranslateAPI('你好', 'zh', 'ko');
 *   console.log('翻译结果:', result);
 * } catch (error) {
 *   console.error('翻译失败:', error);
 * }
 * ```
 */
const callTranslateAPI = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      'DeepSeek API 密钥未配置。请在 .env.local 中设置 NEXT_PUBLIC_DEEPSEEK_API_KEY'
    );
  }

  // 构建用户提示词
  const userPrompt =
    sourceLang === 'zh'
      ? `翻译为韩语：${text}`
      : `翻译为中文：${text}`;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // 降低随机性，提高翻译准确性
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData: DeepSeekError = await response.json();
      await handleAPIError(errorData, response.status, text, sourceLang, targetLang);
    }

    const data: DeepSeekResponse = await response.json();
    const translatedText = data.choices[0]?.message?.content;

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
 * 处理 API 错误（支持智能重试）
 *
 * @description 根据 HTTP 状态码和错误类型决定是否重试或抛出错误
 *
 * @param errorData - 错误响应数据
 * @param status - HTTP 状态码
 * @param text - 原始文本（用于重试）
 * @param sourceLang - 源语言（用于重试）
 * @param targetLang - 目标语言（用于重试）
 * @param retryCount - 当前重试次数（递归调用时使用）
 * @returns 永远不会返回（成功重试会返回结果，失败会抛出错误）
 * @throws Error 重试失败或不应重试时抛出错误
 *
 * @example
 * ```typescript
 * // 通常不需要手动调用，由 callTranslateAPI 自动调用
 * try {
 *   await handleAPIError(errorData, 429, text, sourceLang, targetLang);
 * } catch (error) {
 *   console.error('重试失败:', error);
 * }
 * ```
 */
const handleAPIError = async (
  errorData: DeepSeekError,
  status: number,
  text: string,
  sourceLang: Language,
  targetLang: Language,
  retryCount: number = 0
): Promise<never> => {
  const { message, type } = errorData.error;

  // 智能重试逻辑
  const retryKey = String(status);
  const retryConfigEntry = RETRY_CONFIG[retryKey];

  if (retryConfigEntry && retryCount < retryConfigEntry.maxRetries) {
    console.warn(
      `API 调用失败 (${status})，${retryConfigEntry.delay}ms 后重试...`
    );

    // 等待后重试
    await new Promise((resolve) =>
      setTimeout(resolve, retryConfigEntry.delay)
    );

    try {
      const result = await callTranslateAPI(text, sourceLang, targetLang);
      return result as never; // 重试成功，返回结果
    } catch (retryError) {
      // 重试失败，继续抛出错误
      console.error('重试失败:', retryError);
    }
  }

  // 不重试或重试失败，抛出错误
  switch (status) {
    case 401:
      throw new Error('API 密钥无效或无权限访问');
    case 429:
      throw new Error('请求过于频繁，请稍后再试');
    case 500:
      throw new Error('DeepSeek 服务器错误，请稍后再试');
    case 503:
      throw new Error('DeepSeek 服务暂时不可用，请稍后再试');
    default:
      throw new Error(`翻译失败（${status}）：${message}`);
  }
};

// ============================================================================
// 主翻译函数
// ============================================================================

/**
 * 翻译文本（主函数）
 *
 * @description 对外暴露的主翻译函数，提供完整的翻译流程：
 * 1. 输入验证
 * 2. 缓存检查
 * 3. API 调用
 * 4. 缓存保存
 * 5. 罗马音生成
 *
 * @param text - 要翻译的文本
 * @param sourceLang - 源语言
 * @param targetLang - 目标语言
 * @returns 翻译结果，包含翻译文本、罗马音和离线标识
 * @throws Error 当输入无效或 API 调用失败时抛出错误
 *
 * @example
 * ```typescript
 * // 中文翻译为韩文
 * const result = await translateText('你好', 'zh', 'ko');
 * console.log(result.translatedText); // '안녕하세요'
 * console.log(result.romanization); // 'annyeonghaseyo'
 * console.log(result.isOffline); // false
 *
 * // 韩文翻译为中文
 * const result2 = await translateText('안녕하세요', 'ko', 'zh');
 * console.log(result2.translatedText); // '你好'
 * console.log(result2.romanization); // undefined
 * ```
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
      romanization:
        targetLang === 'ko' ? koreanToRomanization(cached) : undefined,
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
    romanization:
      targetLang === 'ko'
        ? koreanToRomanization(translatedText)
        : undefined,
    isOffline: false,
  };
};

/**
 * 批量翻译（用于预加载常用短语）
 *
 * @description 批量翻译多个文本，跳过失败的项
 *
 * @param texts - 文本数组
 * @param sourceLang - 源语言
 * @param targetLang - 目标语言
 * @returns 翻译结果数组，与输入数组一一对应（失败的项被跳过）
 *
 * @example
 * ```typescript
 * const results = await batchTranslate(['你好', '谢谢', '再见'], 'zh', 'ko');
 * console.log(results); // 3个翻译结果
 * ```
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
 * 清空翻译缓存
 *
 * @description 清除所有内存中的翻译缓存
 *
 * @example
 * ```typescript
 * clearTranslationCache();
 * console.log('缓存已清空');
 * ```
 */
export const clearTranslationCache = (): void => {
  translationCache.clear();
};

/**
 * 获取缓存统计信息
 *
 * @description 返回当前缓存的统计数据，用于调试和监控
 *
 * @returns 缓存统计对象，包含缓存大小和所有缓存键
 *
 * @example
 * ```typescript
 * const stats = getCacheStats();
 * console.log(`缓存项数: ${stats.size}`);
 * console.log('缓存键:', stats.keys);
 * ```
 */
export const getCacheStats = (): { size: number; keys: string[] } => {
  cleanExpiredCache();
  return {
    size: translationCache.size,
    keys: Array.from(translationCache.keys()),
  };
};
