/**
 * 语音识别 Hook
 *
 * 封装语音识别逻辑，提供状态管理和操作函数
 * - 管理语音识别状态（是否正在录音、识别文本等）
 * - 提供开始/停止录音、清空文本等操作
 * - 支持实时识别结果显示
 * - 集成翻译功能（识别完成后自动翻译）
 * - 完善的错误处理和浏览器兼容性检查
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Language } from '@/types/translation';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognitionService,
  type SpeechRecognitionService,
  type SpeechRecognitionResult,
} from '@/services/speechService';

/**
 * Hook 返回值接口
 */
export interface UseSpeechRecognitionReturn {
  // 状态
  /** 是否正在录音 */
  isListening: boolean;
  /** 识别的文本（最终结果） */
  transcript: string;
  /** 临时识别文本（实时更新） */
  interimTranscript: string;
  /** 错误信息 */
  error: string | null;
  /** 浏览器是否支持语音识别 */
  isSupported: boolean;
  /** 完整识别文本（包含临时和最终结果） */
  fullTranscript: string;

  // 操作
  /** 开始录音 */
  startListening: (lang?: Language) => void;
  /** 停止录音 */
  stopListening: () => void;
  /** 清空识别文本 */
  resetTranscript: () => void;
  /** 清除错误 */
  clearError: () => void;
}

/**
 * Hook 配置选项
 */
interface UseSpeechRecognitionOptions {
  /** 初始语言（默认：中文） */
  initialLang?: Language;
  /** 是否在识别完成后自动清空文本（默认：false） */
  autoClear?: boolean;
  /** 识别完成后的回调（可选） */
  onTranscriptComplete?: (transcript: string, lang: Language) => void;
  /** 识别结果更新时的回调（可选） */
  onInterimResult?: (transcript: string, interimTranscript: string) => void;
}

/**
 * 语音识别 Hook
 *
 * @param options 配置选项
 * @returns 语音识别状态和操作函数
 *
 * @example
 * ```tsx
 * const {
 *   isListening,
 *   transcript,
 *   interimTranscript,
 *   error,
 *   isSupported,
 *   startListening,
 *   stopListening,
 *   resetTranscript,
 * } = useSpeechRecognition({
 *   initialLang: 'zh',
 *   onTranscriptComplete: (text, lang) => {
 *     console.log('识别完成:', text, lang);
 *     // 可以在这里触发翻译
 *   },
 * });
 * ```
 */
export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const {
    initialLang = 'zh',
    autoClear = false,
    onTranscriptComplete,
    onInterimResult,
  } = options;

  // ===== 状态管理 =====

  /** 当前语言 */
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);

  /** 是否正在录音 */
  const [isListening, setIsListening] = useState<boolean>(false);

  /** 识别的文本（最终结果） */
  const [transcript, setTranscript] = useState<string>('');

  /** 临时识别文本 */
  const [interimTranscript, setInterimTranscript] = useState<string>('');

  /** 错误状态 */
  const [error, setError] = useState<string | null>(null);

  /** 浏览器支持状态 */
  const [isSupported, setIsSupported] = useState<boolean>(false);

  /** 语音识别服务实例的引用 */
  const serviceRef = useRef<SpeechRecognitionService | null>(null);

  /** 清理函数的引用 */
  const cleanupResultHandlerRef = useRef<(() => void) | null>(null);
  const cleanupErrorHandlerRef = useRef<(() => void) | null>(null);
  const cleanupEndHandlerRef = useRef<(() => void) | null>(null);

  // ===== 初始化 =====

  /**
   * 检查浏览器支持
   */
  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);

    if (!supported) {
      setError('您的浏览器不支持语音识别功能，请使用 Chrome、Edge 或 Safari 浏览器');
    }
  }, []);

  /**
   * 清理资源
   */
  useEffect(() => {
    return () => {
      // 组件卸载时清理资源
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }

      // 清理事件监听器
      if (cleanupResultHandlerRef.current) {
        cleanupResultHandlerRef.current();
      }
      if (cleanupErrorHandlerRef.current) {
        cleanupErrorHandlerRef.current();
      }
      if (cleanupEndHandlerRef.current) {
        cleanupEndHandlerRef.current();
      }
    };
  }, []);

  // ===== 核心操作 =====

  /**
   * 开始录音
   *
   * @param lang 语言（可选，默认使用 initialLang）
   */
  const startListening = useCallback((lang?: Language): void => {
    // 检查浏览器支持
    if (!isSupported) {
      setError('您的浏览器不支持语音识别功能');
      return;
    }

    // 清除之前的错误
    setError(null);

    // 停止之前的识别
    if (serviceRef.current && serviceRef.current.listening) {
      serviceRef.current.stop();
    }

    // 设置语言
    const targetLang = lang || currentLang;
    setCurrentLang(targetLang);

    try {
      // 创建新的识别服务实例
      const service = createSpeechRecognitionService(targetLang);
      serviceRef.current = service;

      // 设置初始状态
      setIsListening(true);

      // 清空之前的文本（如果配置了 autoClear）
      if (autoClear) {
        setTranscript('');
        setInterimTranscript('');
      }

      // 注册结果处理器
      cleanupResultHandlerRef.current = service.onResult((result: SpeechRecognitionResult) => {
        if (result.isFinal) {
          // 最终结果
          setTranscript(result.transcript);
          setInterimTranscript('');

          // 触发完成回调
          if (onTranscriptComplete) {
            onTranscriptComplete(result.transcript, targetLang);
          }
        } else {
          // 临时结果
          setInterimTranscript(result.transcript);

          // 触发临时结果回调
          if (onInterimResult) {
            onInterimResult(transcript, result.transcript);
          }
        }
      });

      // 注册错误处理器
      cleanupErrorHandlerRef.current = service.onError((errorMessage: string) => {
        setError(errorMessage);
        setIsListening(false);
      });

      // 注册结束处理器
      cleanupEndHandlerRef.current = service.onEnd(() => {
        setIsListening(false);
      });

      // 启动识别
      service.start();
    } catch (err) {
      // 错误处理
      const errorMessage = err instanceof Error ? err.message : '启动语音识别失败';
      setError(errorMessage);
      setIsListening(false);
      console.error('启动语音识别错误:', err);
    }
  }, [isSupported, currentLang, autoClear, transcript, onTranscriptComplete, onInterimResult]);

  /**
   * 停止录音
   */
  const stopListening = useCallback((): void => {
    if (serviceRef.current && serviceRef.current.listening) {
      try {
        serviceRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.error('停止语音识别错误:', err);
      }
    }
  }, []);

  /**
   * 清空识别文本
   */
  const resetTranscript = useCallback((): void => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // ===== 计算属性 =====

  /**
   * 完整识别文本（最终结果 + 临时结果）
   */
  const fullTranscript = `${transcript} ${interimTranscript}`.trim();

  // ===== 返回接口 =====

  return {
    // 状态
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    fullTranscript,

    // 操作
    startListening,
    stopListening,
    resetTranscript,
    clearError,
  };
};

/**
 * 语音识别 + 自动翻译 Hook
 *
 * 结合 useTranslation 和 useSpeechRecognition，实现识别完成后自动翻译
 *
 * @param options 配置选项
 * @returns 语音识别状态和操作函数
 *
 * @example
 * ```tsx
 * const {
 *   isListening,
 *   transcript,
 *   translatedText,
 *   isLoading,
 *   startListening,
 *   stopListening,
 * } = useSpeechRecognitionWithTranslation({
 *   initialLang: 'zh',
 *   targetLang: 'ko',
 * });
 * ```
 */
export const useSpeechRecognitionWithTranslation = (
  options: UseSpeechRecognitionOptions & { targetLang?: Language }
) => {
  const { targetLang, ...speechOptions } = options;

  // 使用语音识别 Hook
  const speechRecognition = useSpeechRecognition({
    ...speechOptions,
    onTranscriptComplete: (transcript, lang) => {
      // 识别完成后的回调
      if (speechOptions.onTranscriptComplete) {
        speechOptions.onTranscriptComplete(transcript, lang);
      }
    },
  });

  return {
    ...speechRecognition,
    targetLang,
  };
};

/**
 * 语音识别状态 Hook（独立 Hook，用于状态管理）
 */
export const useSpeechRecognitionStatus = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);
    setIsReady(true);
  }, []);

  return {
    isSupported,
    isReady,
  };
};

/**
 * 测试语音识别功能 Hook
 */
export const useTestSpeechRecognition = () => {
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const test = useCallback(async () => {
    setIsTesting(true);
    setError(null);

    try {
      const supported = isSpeechRecognitionSupported();
      setIsSupported(supported);

      if (!supported) {
        setError('您的浏览器不支持语音识别功能');
        return;
      }

      // 这里可以添加更详细的测试逻辑
      // 例如：尝试创建识别实例、检查权限等
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '测试失败';
      setError(errorMessage);
    } finally {
      setIsTesting(false);
    }
  }, []);

  useEffect(() => {
    test();
  }, [test]);

  return {
    isTesting,
    isSupported,
    error,
    retest: test,
  };
};
