/**
 * 翻译功能类型定义
 */

/**
 * 支持的语言类型
 */
export type Language = 'zh' | 'ko';

/**
 * 语言显示名称映射
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  zh: '中文',
  ko: '한국어',
} as const;

/**
 * 输入模式
 */
export type InputMode = 'text' | 'voice';

/**
 * 短语分类类型
 */
export type PhraseCategory =
  | 'restaurant'
  | 'shopping'
  | 'transportation'
  | 'emergency'
  | 'accommodation'
  | 'greeting';

/**
 * 短语分类元数据
 */
export interface CategoryMetadata {
  /** 分类图标 emoji */
  icon: string;
  /** 分类中文名称 */
  name: string;
  /** 该分类的短语数量 */
  count: number;
}

/**
 * 短语条目
 */
export interface Phrase {
  /** 唯一标识符 */
  id: string;
  /** 中文文本 */
  zh: string;
  /** 韩文文本 */
  ko: string;
  /** 罗马音（韩文发音标注） */
  romanization: string;
  /** 所属分类 */
  category: PhraseCategory;
  /** 是否为用户收藏 */
  isFavorite?: boolean;
  /** 使用次数（用于排序） */
  usageCount?: number;
}

/**
 * 翻译历史记录
 */
export interface TranslationHistory {
  /** 唯一标识符 */
  id: string;
  /** 源文本 */
  sourceText: string;
  /** 翻译结果 */
  targetText: string;
  /** 源语言 */
  sourceLang: Language;
  /** 目标语言 */
  targetLang: Language;
  /** 罗马音（如果目标语言是韩文） */
  romanization?: string;
  /** 时间戳 */
  timestamp: number;
  /** 是否为离线短语匹配 */
  isOffline: boolean;
}

/**
 * 翻译状态
 */
export interface TranslationState {
  // 输入相关
  /** 用户输入的文本 */
  sourceText: string;
  /** 翻译结果 */
  targetText: string;
  /** 源语言 */
  sourceLang: Language;
  /** 目标语言 */
  targetLang: Language;
  /** 罗马音（韩文发音） */
  romanization: string;

  // UI 状态
  /** 翻译中 */
  isLoading: boolean;
  /** 输入模式 */
  inputMode: InputMode;

  // 快捷短语
  /** 当前显示的快捷短语 */
  quickPhrases: Phrase[];
  /** 选中的短语分类 */
  selectedCategory: PhraseCategory | 'all';

  // 历史记录
  /** 最近翻译历史 */
  history: TranslationHistory[];

  // 错误处理
  /** 错误信息 */
  error: string | null;
}

/**
 * 翻译结果
 */
export interface TranslationResult {
  /** 翻译后的文本 */
  translatedText: string;
  /** 罗马音（韩文） */
  romanization?: string;
  /** 是否来自离线短语库 */
  isOffline: boolean;
  /** 匹配的短语（如果是离线匹配） */
  matchedPhrase?: Phrase;
}

/**
 * 语音识别状态
 */
export type SpeechRecognitionStatus =
  | 'idle'        // 空闲
  | 'listening';  // 正在监听

/**
 * OCR 识别状态
 */
export type OcrStatus =
  | 'idle'        // 空闲
  | 'processing'  // 处理中
  | 'success'     // 成功
  | 'error';      // 错误

/**
 * 翻译错误类型
 */
export type TranslationErrorType =
  | 'network_error'           // 网络错误
  | 'api_quota_exceeded'      // API 配额超限
  | 'invalid_input'           // 无效输入
  | 'unsupported_language';   // 不支持的语言

/**
 * 翻译错误
 */
export interface TranslationError {
  /** 错误类型 */
  type: TranslationErrorType;
  /** 错误消息 */
  message: string;
  /** 是否可以降级到离线模式 */
  canFallbackToOffline: boolean;
}
