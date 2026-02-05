import { romanize } from '@daun_jung/korean-romanizer';

/**
 * 将韩文转换为罗马音（拼音式发音）
 *
 * 使用 @daun_jung/korean-romanizer 库进行转换
 * - 支持完整的韩文字符转换
 * - 遵循韩国文化观光部 2000 年罗马字表记法
 * - 自动处理韩文字符组合和读音规则
 *
 * @param koreanText - 韩文文本
 * @returns 罗马音文本，转换失败时返回占位符
 *
 * @example
 * ```typescript
 * koreanToRomanization('안녕하세요'); // 'annyeonghaseyo'
 * koreanToRomanization('감사합니다'); // 'gamsahamnida'
 * koreanToRomanization(''); // ''
 * ```
 */
export const koreanToRomanization = (koreanText: string): string => {
  // 参数验证
  if (!koreanText || koreanText.trim().length === 0) {
    return '';
  }

  try {
    // 调用 @daun_jung/korean-romanizer 的 romanize 函数
    const romanization = romanize(koreanText);
    return romanization;
  } catch (error) {
    // 错误处理：记录警告并返回占位符
    console.warn('韩文罗马音转换失败:', error);
    return `[韩文发音: ${koreanText.length} 字]`;
  }
};

/**
 * 批量将韩文转换为罗马音
 *
 * 对多个韩文字符串进行批量转换，提高处理效率
 *
 * @param koreanTexts - 韩文文本数组
 * @returns 罗马音文本数组，与输入数组一一对应
 *
 * @example
 * ```typescript
 * batchKoreanToRomanization(['안녕하세요', '감사합니다']);
 * // ['annyeonghaseyo', 'gamsahamnida']
 * ```
 */
export const batchKoreanToRomanization = (
  koreanTexts: string[]
): string[] => {
  // 参数验证
  if (!Array.isArray(koreanTexts) || koreanTexts.length === 0) {
    return [];
  }

  // 批量转换
  return koreanTexts.map((text) => koreanToRomanization(text));
};

/**
 * 判断文本是否需要罗马音转换
 *
 * 检查文本中是否包含韩文字符，以确定是否需要罗马音转换
 *
 * @param text - 输入文本
 * @returns 是否包含韩文字符
 *
 * @example
 * ```typescript
 * needsRomanization('안녕하세요'); // true
 * needsRomanization('你好'); // false
 * needsRomanization('Hello 안녕'); // true
 * ```
 */
export const needsRomanization = (text: string): boolean => {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // 韩文字符 Unicode 范围: \uAC00-\uD7A3
  const koreanRegex = /[\uAC00-\uD7A3]/;
  return koreanRegex.test(text);
};

/**
 * 智能转换：仅对韩文部分进行罗马音转换
 *
 * 如果文本中包含韩文字符，则转换为罗马音；否则返回原文本
 *
 * @param text - 输入文本
 * @returns 罗马音或原文本
 *
 * @example
 * ```typescript
 * smartRomanization('안녕하세요'); // 'annyeonghaseyo'
 * smartRomanization('你好'); // '你好'
 * smartRomanization(''); // ''
 * ```
 */
export const smartRomanization = (text: string): string => {
  if (!text || text.trim().length === 0) {
    return '';
  }

  // 如果包含韩文，进行转换
  if (needsRomanization(text)) {
    return koreanToRomanization(text);
  }

  // 否则返回原文本
  return text;
};
