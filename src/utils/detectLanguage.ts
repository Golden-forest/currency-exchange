import type { Language } from '@/types/translation';

/**
 * 检测文本语言
 *
 * 规则:
 * - 如果包含韩文字符 → 返回 'ko'
 * - 如果包含中文字符 → 返回 'zh'
 * - 默认返回 'zh' (中文)
 *
 * @param text 输入文本
 * @returns 检测到的语言
 */
export const detectLanguage = (text: string): Language => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return 'zh'; // 默认中文
  }

  // 检查是否包含韩文字符
  // 韩文字符 Unicode 范围: \uAC00-\uD7A3
  const hasKorean = /[\uAC00-\uD7A3]/.test(trimmedText);

  if (hasKorean) {
    return 'ko';
  }

  // 检查是否包含中文字符
  // 中文字符 Unicode 范围: \u4E00-\u9FFF
  const hasChinese = /[\u4E00-\u9FFF]/.test(trimmedText);

  if (hasChinese) {
    return 'zh';
  }

  // 默认返回中文
  return 'zh';
};

/**
 * 判断文本是否为韩文
 */
export const isKorean = (text: string): boolean => {
  return detectLanguage(text) === 'ko';
};

/**
 * 判断文本是否为中文
 */
export const isChinese = (text: string): boolean => {
  return detectLanguage(text) === 'zh';
};
