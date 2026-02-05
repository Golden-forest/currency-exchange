/**
 * 语音识别服务 (Speech Recognition)
 *
 * 使用 Web Speech API (SpeechRecognition) 实现语音转文字功能
 * - 支持中文和韩语识别
 * - 实时返回识别结果
 * - 完善的错误处理和浏览器兼容性检查
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
 */

import type { Language } from '@/types/translation';

/**
 * 支持的语言代码（用于 SpeechRecognition API）
 */
const SPEECH_LANG_MAP: Record<Language, string> = {
  zh: 'zh-CN',
  ko: 'ko-KR',
};

/**
 * 语音识别事件类型
 */
export type SpeechRecognitionEventType =
  | 'result'      // 识别结果
  | 'error'       // 错误
  | 'end';        // 识别结束

/**
 * 识别结果回调
 */
export interface SpeechRecognitionResult {
  /** 识别的文本 */
  transcript: string;
  /** 是否为最终结果 */
  isFinal: boolean;
  /** 置信度（0-1） */
  confidence: number;
}

/**
 * 事件处理器类型
 */
export type ResultHandler = (result: SpeechRecognitionResult) => void;
export type ErrorHandler = (error: string) => void;
export type EndHandler = () => void;

/**
 * 语音识别配置
 */
interface SpeechRecognitionConfig {
  /** 语言（'zh-CN' 或 'ko-KR'） */
  lang?: string;
  /** 是否连续识别（默认：false） */
  continuous?: boolean;
  /** 是否返回临时结果（默认：true） */
  interimResults?: boolean;
  /** 最大候选结果数（默认：1） */
  maxAlternatives?: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: SpeechRecognitionConfig = {
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
};

/**
 * 语音识别错误类型映射
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  'no-speech': '未检测到语音，请重试',
  'audio-capture': '无法访问麦克风，请检查麦克风设备',
  'not-allowed': '麦克风权限被拒绝。请点击浏览器地址栏的锁图标，允许访问麦克风后重试',
  'network': '网络错误，请检查网络连接',
  'aborted': '识别被中断',
  'language-not-supported': '不支持该语言',
  'service-not-allowed': '语音识别服务不可用。请确保使用 HTTPS 或 localhost 访问',
};

/**
 * 浏览器兼容性检查
 *
 * 检查浏览器是否支持 SpeechRecognition API
 *
 * @returns 是否支持语音识别
 */
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查是否为 HTTPS 或 localhost（语音识别 API 要求）
  const isSecureContext = window.location.protocol === 'https:' ||
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

  if (!isSecureContext) {
    console.warn('语音识别 API 需要安全上下文（HTTPS 或 localhost）');
    return false;
  }

  // 检查标准 API 和浏览器前缀版本
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
};

/**
 * 获取 SpeechRecognition 构造函数
 *
 * 处理浏览器兼容性，返回正确的构造函数
 *
 * @returns SpeechRecognition 构造函数
 * @throws Error 当浏览器不支持时
 */
const getSpeechRecognition = (): any => {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('您的浏览器不支持语音识别功能，请使用 Chrome、Edge 或 Safari 浏览器');
  }

  // 优先使用标准 API，fallback 到 webkit 前缀版本
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SpeechRecognitionClass;
};

/**
 * 语音识别服务类
 *
 * 封装 Web Speech API，提供简化的接口
 */
export class SpeechRecognitionService {
  private recognition: any;
  private isListening: boolean = false;
  private resultHandlers: Set<ResultHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private endHandlers: Set<EndHandler> = new Set();
  private timeoutTimer: NodeJS.Timeout | null = null;
  private readonly TIMEOUT_MS = 30000; // 30秒超时

  /**
   * 构造函数
   *
   * @param config 识别配置
   */
  constructor(config: SpeechRecognitionConfig = {}) {
    const SpeechRecognitionClass = getSpeechRecognition();

    // 创建识别实例
    this.recognition = new SpeechRecognitionClass();

    // 应用配置
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    this.recognition.continuous = finalConfig.continuous;
    this.recognition.interimResults = finalConfig.interimResults;
    this.recognition.maxAlternatives = finalConfig.maxAlternatives;

    if (finalConfig.lang) {
      this.recognition.lang = finalConfig.lang;
    }

    // 绑定事件处理器
    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // 识别结果事件
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      const confidence = result[0].confidence || 0;

      const recognitionResult: SpeechRecognitionResult = {
        transcript,
        isFinal,
        confidence,
      };

      // 收到结果时重置超时计时器
      this.resetTimeoutTimer();

      // 通知所有结果处理器
      this.resultHandlers.forEach(handler => {
        try {
          handler(recognitionResult);
        } catch (error) {
          console.error('识别结果处理器错误:', error);
        }
      });
    };

    // 错误事件
    this.recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event);

      // 清理超时计时器
      this.clearTimeoutTimer();

      const errorMessage = ERROR_MESSAGE_MAP[event.error] ||
        `识别失败: ${event.error}`;

      // 通知所有错误处理器
      this.errorHandlers.forEach(handler => {
        try {
          handler(errorMessage);
        } catch (error) {
          console.error('错误处理器错误:', error);
        }
      });

      // 停止识别
      this.isListening = false;
    };

    // 识别结束事件
    this.recognition.onend = () => {
      this.isListening = false;

      // 清理超时计时器
      this.clearTimeoutTimer();

      // 通知所有结束处理器
      this.endHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error('结束处理器错误:', error);
        }
      });
    };

    // 识别开始事件
    this.recognition.onstart = () => {
      this.isListening = true;
      // 启动超时计时器
      this.startTimeoutTimer();
    };
  }

  /**
   * 启动语音识别
   *
   * @returns Promise，识别完成时 resolve
   */
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 如果已经在监听，先停止
        if (this.isListening) {
          this.stop();
        }

        // 添加一次性的结束处理器
        const onEnd = () => {
          this.endHandlers.delete(onEnd);
          resolve();
        };

        this.endHandlers.add(onEnd);

        // 启动识别
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 启动超时计时器
   */
  private startTimeoutTimer(): void {
    this.clearTimeoutTimer();
    this.timeoutTimer = setTimeout(() => {
      if (this.isListening) {
        console.warn('语音识别超时，自动停止');
        this.abort();
        // 通知错误处理器
        this.errorHandlers.forEach(handler => {
          try {
            handler('语音识别超时，请重试');
          } catch (error) {
            console.error('超时错误处理器错误:', error);
          }
        });
      }
    }, this.TIMEOUT_MS);
  }

  /**
   * 重置超时计时器
   */
  private resetTimeoutTimer(): void {
    if (this.isListening) {
      this.startTimeoutTimer();
    }
  }

  /**
   * 清理超时计时器
   */
  private clearTimeoutTimer(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  /**
   * 停止语音识别
   */
  public stop(): void {
    if (this.isListening) {
      this.clearTimeoutTimer();
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('停止识别错误:', error);
      }
    }
  }

  /**
   * 中止语音识别（立即停止，不等待结果）
   */
  public abort(): void {
    if (this.isListening) {
      this.clearTimeoutTimer();
      try {
        this.recognition.abort();
      } catch (error) {
        console.error('中止识别错误:', error);
      }
    }
  }

  /**
   * 添加结果处理器
   *
   * @param handler 结果处理函数
   * @returns 清理函数
   */
  public onResult(handler: ResultHandler): () => void {
    this.resultHandlers.add(handler);
    return () => this.resultHandlers.delete(handler);
  }

  /**
   * 添加错误处理器
   *
   * @param handler 错误处理函数
   * @returns 清理函数
   */
  public onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * 添加结束处理器
   *
   * @param handler 结束处理函数
   * @returns 清理函数
   */
  public onEnd(handler: EndHandler): () => void {
    this.endHandlers.add(handler);
    return () => this.endHandlers.delete(handler);
  }

  /**
   * 检查是否正在监听
   */
  public get listening(): boolean {
    return this.isListening;
  }

  /**
   * 销毁实例，清理资源
   */
  public destroy(): void {
    this.stop();
    this.clearTimeoutTimer();
    this.resultHandlers.clear();
    this.errorHandlers.clear();
    this.endHandlers.clear();
    this.recognition = null;
  }
}

/**
 * 创建语音识别服务实例
 *
 * @param lang 语言（'zh' 或 'ko'）
 * @param config 额外配置
 * @returns 语音识别服务实例
 */
export const createSpeechRecognitionService = (
  lang: Language = 'zh',
  config: Omit<SpeechRecognitionConfig, 'lang'> = {}
): SpeechRecognitionService => {
  const langCode = SPEECH_LANG_MAP[lang];
  return new SpeechRecognitionService({ ...config, lang: langCode });
};

/**
 * 快捷函数：启动语音识别
 *
 * @param lang 语言
 * @param onResult 结果回调
 * @param onError 错误回调
 * @returns Promise 和停止函数
 */
export const startRecognition = (
  lang: Language,
  onResult: (result: SpeechRecognitionResult) => void,
  onError?: (error: string) => void
): { promise: Promise<void>; stop: () => void } => {
  const service = createSpeechRecognitionService(lang);

  if (onResult) {
    service.onResult(onResult);
  }

  if (onError) {
    service.onError(onError);
  }

  const promise = service.start();

  return {
    promise,
    stop: () => service.stop(),
  };
};

/**
 * 测试语音识别功能
 *
 * @returns Promise，测试完成时返回是否支持
 */
export const testSpeechRecognition = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isSpeechRecognitionSupported()) {
      resolve(false);
      return;
    }

    try {
      const SpeechRecognitionClass = getSpeechRecognition();
      const testRecognition = new SpeechRecognitionClass();

      // 尝试启动（会立即失败，因为没有权限）
      testRecognition.onstart = () => {
        testRecognition.abort();
        resolve(true);
      };

      testRecognition.onerror = () => {
        resolve(true); // 错误也算支持，只是没有权限
      };

      testRecognition.start();
    } catch (error) {
      resolve(false);
    }
  });
};
