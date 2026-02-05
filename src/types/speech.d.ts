/**
 * Web Speech API 类型定义
 *
 * 为 SpeechRecognition API 添加 TypeScript 类型支持
 * 由于这是实验性 API，TypeScript 默认类型定义中可能不包含
 * 参考: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
 */

/**
 * SpeechRecognition 接口
 */
interface SpeechRecognition extends EventTarget {
  /** 识别语言 */
  lang: string;
  /** 是否连续识别 */
  continuous: boolean;
  /** 是否返回临时结果 */
  interimResults: boolean;
  /** 最大候选结果数 */
  maxAlternatives: number;
  /** 服务 URI */
  serviceURI: string;

  /** 启动识别 */
  start(): void;
  /** 停止识别 */
  stop(): void;
  /** 中止识别 */
  abort(): void;

  /** 事件：识别开始 */
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** 事件：识别结束 */
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** 事件：识别结果 */
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  /** 事件：识别错误 */
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  /** 事件：音频开始 */
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** 事件：音频结束 */
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** 事件：声音开始 */
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** 事件：声音结束 */
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** 事件：语音开始 */
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  /** 事件：语音结束 */
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

/**
 * SpeechRecognition 构造函数
 */
interface SpeechRecognitionConstructor {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
}

/**
 * SpeechRecognitionEvent 接口
 */
interface SpeechRecognitionEvent extends Event {
  /** 只读属性：识别结果列表 */
  readonly resultIndex: number;
  /** 只读属性：SpeechRecognitionResultList 对象 */
  readonly results: SpeechRecognitionResultList;
}

/**
 * SpeechRecognitionErrorEvent 接口
 */
interface SpeechRecognitionErrorEvent extends Event {
  /** 只读属性：错误类型 */
  readonly error: string;
  /** 只读属性：错误消息 */
  readonly message: string;
}

/**
 * SpeechRecognitionResultList 接口
 */
interface SpeechRecognitionResultList {
  /** 只读属性：结果列表长度 */
  readonly length: number;
  /** 通过索引访问结果 */
  [index: number]: SpeechRecognitionResult;
  /** 迭代器 */
  [Symbol.iterator](): IterableIterator<SpeechRecognitionResult>;
}

/**
 * SpeechRecognitionResult 接口
 */
interface SpeechRecognitionResult {
  /** 只读属性：是否为最终结果 */
  readonly isFinal: boolean;
  /** 只读属性：候选列表 */
  readonly length: number;
  /** 通过索引访问候选 */
  [index: number]: SpeechRecognitionAlternative;
  /** 迭代器 */
  [Symbol.iterator](): IterableIterator<SpeechRecognitionAlternative>;
}

/**
 * SpeechRecognitionAlternative 接口
 */
interface SpeechRecognitionAlternative {
  /** 只读属性：识别的文本 */
  readonly transcript: string;
  /** 只读属性：置信度（0-1） */
  readonly confidence: number;
}

/**
 * Window 接口扩展
 */
interface Window {
  /** 标准 SpeechRecognition API（Chrome 25+） */
  SpeechRecognition?: SpeechRecognitionConstructor;
  /** Webkit 前缀版本（Chrome 早期版本、Edge、Safari） */
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

/**
 * 全局类型声明
 */
declare global {
  /**
   * SpeechRecognition 构造函数（全局作用域）
   */
  const SpeechRecognition: SpeechRecognitionConstructor;
}

/**
 * 导出类型（供其他模块使用）
 */
export type {
  SpeechRecognition,
  SpeechRecognitionConstructor,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionResultList,
  SpeechRecognitionResult,
  SpeechRecognitionAlternative,
};
