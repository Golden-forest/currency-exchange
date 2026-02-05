/**
 * 语音合成服务 (Text-to-Speech)
 *
 * 使用 Web Speech Synthesis API 实现文本朗读功能
 * - 支持中文和韩语朗读
 * - 支持调节语速
 * - 完善的错误处理
 */

import type { Language } from '@/types/translation';

/**
 * 语音合成配置
 */
interface TtsConfig {
  /** 语速（0.1 - 2.0，默认 1.0） */
  rate?: number;
  /** 音调（0 - 2，默认 1） */
  pitch?: number;
  /** 音量（0 - 1，默认 1） */
  volume?: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: TtsConfig = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

/**
 * 针对不同语言的优化配置
 */
const LANGUAGE_OPTIMIZED_CONFIG: Record<Language, TtsConfig> = {
  zh: {
    rate: 1.0,   // 中文正常语速
    pitch: 1.0,  // 正常音调
    volume: 1.0,
  },
  ko: {
    rate: 0.9,   // 韩语稍慢一点，更清晰自然
    pitch: 1.0,  // 正常音调
    volume: 1.0,
  },
};

/**
 * 语言代码映射
 */
const LANGUAGE_CODE_MAP: Record<Language, string> = {
  zh: 'zh-CN',
  ko: 'ko-KR',
};

/**
 * 检查浏览器是否支持语音合成
 */
export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

/**
 * 检查是否正在朗读
 */
export const isSpeaking = (): boolean => {
  if (!isSpeechSynthesisSupported()) {
    return false;
  }
  return window.speechSynthesis.speaking;
};

/**
 * 停止朗读
 */
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * 朗读文本
 *
 * @param text 要朗读的文本
 * @param lang 语言
 * @param config 配置选项
 * @returns Promise，朗读完成时 resolve
 * @throws Error 当浏览器不支持或朗读失败时
 */
export const speak = (
  text: string,
  lang: Language,
  config: TtsConfig = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查浏览器支持
    if (!isSpeechSynthesisSupported()) {
      reject(new Error('您的浏览器不支持语音合成功能'));
      return;
    }

    // 输入验证
    if (!text || text.trim().length === 0) {
      reject(new Error('朗读文本不能为空'));
      return;
    }

    // 停止当前朗读
    stopSpeaking();

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(text.trim());

    // 设置语言
    utterance.lang = LANGUAGE_CODE_MAP[lang];

    // 应用针对该语言的优化配置
    const optimizedConfig = LANGUAGE_OPTIMIZED_CONFIG[lang];
    const finalConfig = { ...optimizedConfig, ...config };

    utterance.rate = finalConfig.rate || 1.0;
    utterance.pitch = finalConfig.pitch || 1.0;
    utterance.volume = finalConfig.volume || 1.0;

    // 智能选择最佳语音
    const bestVoice = getBestVoice(lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log(`使用语音: ${bestVoice.name} (${bestVoice.lang})`);
    }

    // 监听事件
    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('语音合成错误:', event);
      reject(new Error('朗读失败，请稍后再试'));
    };

    // 开始朗读
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * 获取可用的语音列表
 *
 * @param language 语言（可选）
 * @returns 语音列表
 */
export const getAvailableVoices = (language?: Language): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();

  if (!language) {
    return voices;
  }

  const langCode = LANGUAGE_CODE_MAP[language];
  return voices.filter(voice => voice.lang.startsWith(langCode));
};

/**
 * 获取最佳语音（针对特定语言优化）
 *
 * @param language 语言
 * @returns 最佳语音，如果没有则返回 undefined
 */
export const getBestVoice = (language: Language): SpeechSynthesisVoice | undefined => {
  if (!isSpeechSynthesisSupported()) {
    return undefined;
  }

  const voices = window.speechSynthesis.getVoices();
  const langCode = LANGUAGE_CODE_MAP[language];

  // 优先级顺序：
  // 1. 本地服务的高质量语音
  // 2. 本地服务的任何语音
  // 3. 匹配语言的任何语音
  // 4. 第一个可用语音

  return voices.find(voice =>
    voice.lang.startsWith(langCode) &&
    voice.localService &&
    (voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Premium'))
  ) || voices.find(voice =>
    voice.lang.startsWith(langCode) && voice.localService
  ) || voices.find(voice =>
    voice.lang.startsWith(langCode)
  ) || voices[0];
};

/**
 * 预加载语音列表
 *
 * 某些浏览器需要触发语音列表加载
 */
export const preloadVoices = (): void => {
  if (!isSpeechSynthesisSupported()) {
    return;
  }

  // 触发语音列表加载
  window.speechSynthesis.getVoices();

  // 监听语音列表变化
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      console.log('语音列表已加载');
    };
  }
};

/**
 * 测试语音合成功能
 *
 * @returns Promise，测试完成时 resolve
 */
export const testSpeechSynthesis = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve(false);
      return;
    }

    // 检查是否有可用的语音
    const voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      // 等待语音列表加载
      setTimeout(() => {
        const updatedVoices = window.speechSynthesis.getVoices();
        resolve(updatedVoices.length > 0);
      }, 100);
    } else {
      resolve(true);
    }
  });
};

/**
 * 语音合成类（封装状态管理）
 */
export class TtsService {
  private currentLang: Language;
  private currentConfig: TtsConfig;

  constructor(lang: Language = 'zh', config: TtsConfig = {}) {
    this.currentLang = lang;
    this.currentConfig = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 设置语言
   */
  setLanguage(lang: Language): void {
    this.currentLang = lang;
  }

  /**
   * 设置配置
   */
  setConfig(config: TtsConfig): void {
    this.currentConfig = { ...this.currentConfig, ...config };
  }

  /**
   * 朗读文本
   */
  speak(text: string, lang?: Language): Promise<void> {
    const targetLang = lang || this.currentLang;
    return speak(text, targetLang, this.currentConfig);
  }

  /**
   * 停止朗读
   */
  stop(): void {
    stopSpeaking();
  }

  /**
   * 检查是否正在朗读
   */
  isActive(): boolean {
    return isSpeaking();
  }
}

/**
 * 创建 TTS 服务实例
 */
export const createTtsService = (lang?: Language, config?: TtsConfig): TtsService => {
  return new TtsService(lang, config);
};
