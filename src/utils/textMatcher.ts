/**
 * 文本模糊匹配工具
 *
 * 功能：
 * - 使用编辑距离（Levenshtein Distance）计算文本相似度
 * - 支持部分匹配（用户输入"多少钱"可以匹配"请问这个多少钱？"）
 * - 返回最佳匹配结果（相似度 > 0.7）
 * - 性能优化：短语库索引
 */

import type { Phrase, Language } from '../types/translation';

/**
 * 匹配结果
 */
export interface MatchResult {
  /** 匹配的短语 */
  phrase: Phrase;
  /** 相似度（0-1） */
  similarity: number;
  /** 匹配的语言（zh 或 ko） */
  matchedLang: Language;
}

/**
 * 短语库索引
 * 按分类和首字符索引，提高搜索性能
 */
class PhraseIndex {
  /** 按分类索引 */
  private categoryIndex: Map<string, Phrase[]> = new Map();

  /** 按中文首字符索引 */
  private zhFirstCharIndex: Map<string, Phrase[]> = new Map();

  /** 按韩文首字符索引 */
  private koFirstCharIndex: Map<string, Phrase[]> = new Map();

  /**
   * 构建索引
   */
  build(phrases: Phrase[]): void {
    // 清空现有索引
    this.categoryIndex.clear();
    this.zhFirstCharIndex.clear();
    this.koFirstCharIndex.clear();

    // 构建分类索引
    for (const phrase of phrases) {
      const category = phrase.category;

      if (!this.categoryIndex.has(category)) {
        this.categoryIndex.set(category, []);
      }
      this.categoryIndex.get(category)!.push(phrase);

      // 构建中文首字符索引
      if (phrase.zh && phrase.zh.length > 0) {
        const firstChar = phrase.zh[0];
        if (!this.zhFirstCharIndex.has(firstChar)) {
          this.zhFirstCharIndex.set(firstChar, []);
        }
        this.zhFirstCharIndex.get(firstChar)!.push(phrase);
      }

      // 构建韩文首字符索引
      if (phrase.ko && phrase.ko.length > 0) {
        const firstChar = phrase.ko[0];
        if (!this.koFirstCharIndex.has(firstChar)) {
          this.koFirstCharIndex.set(firstChar, []);
        }
        this.koFirstCharIndex.get(firstChar)!.push(phrase);
      }
    }
  }

  /**
   * 根据分类获取短语
   */
  getByCategory(category: string): Phrase[] {
    return this.categoryIndex.get(category) || [];
  }

  /**
   * 根据中文首字符获取短语
   */
  getByZhFirstChar(char: string): Phrase[] {
    return this.zhFirstCharIndex.get(char) || [];
  }

  /**
   * 根据韩文首字符获取短语
   */
  getByKoFirstChar(char: string): Phrase[] {
    return this.koFirstCharIndex.get(char) || [];
  }

  /**
   * 获取所有短语
   */
  getAll(): Phrase[] {
    const all: Phrase[] = [];
    // 使用 Array.from 转换 Map.values()
    Array.from(this.categoryIndex.values()).forEach(phrases => {
      all.push(...phrases);
    });
    return all;
  }
}

/**
 * 全局短语索引实例
 */
let phraseIndex: PhraseIndex | null = null;

/**
 * 获取短语索引实例
 */
const getPhraseIndex = (): PhraseIndex => {
  if (!phraseIndex) {
    phraseIndex = new PhraseIndex();
  }
  return phraseIndex;
};

/**
 * 初始化短语索引
 *
 * @param phrases 短语库
 */
export const initPhraseIndex = (phrases: Phrase[]): void => {
  const index = getPhraseIndex();
  index.build(phrases);
};

/**
 * 计算两个字符串的编辑距离（Levenshtein Distance）
 *
 * 编辑距离是指将一个字符串转换为另一个字符串所需的最少单字符编辑次数
 *（插入、删除、替换）
 *
 * @param str1 第一个字符串
 * @param str2 第二个字符串
 * @returns 编辑距离
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;

  // 创建二维数组存储动态规划结果
  const dp: number[][] = Array.from({ length: len1 + 1 }, () =>
    Array(len2 + 1).fill(0)
  );

  // 初始化第一行和第一列
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }

  // 动态规划计算
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        // 字符相同，不需要编辑
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // 字符不同，取三种操作的最小值 + 1
        dp[i][j] =
          Math.min(
            dp[i - 1][j],      // 删除
            dp[i][j - 1],      // 插入
            dp[i - 1][j - 1]   // 替换
          ) + 1;
      }
    }
  }

  return dp[len1][len2];
};

/**
 * 计算两个字符串的相似度（0-1）
 *
 * @param str1 第一个字符串
 * @param str2 第二个字符串
 * @returns 相似度（0 = 完全不同，1 = 完全相同）
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);

  // 使用 1 - (编辑距离 / 最大长度) 计算相似度
  const similarity = 1 - distance / maxLen;

  return Math.max(0, similarity);
};

/**
 * 检查字符串是否包含子字符串（不区分大小写）
 *
 * @param text 完整文本
 * @param search 搜索的子字符串
 * @returns 是否包含
 */
export const containsSubstring = (text: string, search: string): boolean => {
  if (!search || search.length === 0) return false;
  return text.toLowerCase().includes(search.toLowerCase());
};

/**
 * 检查两个字符串是否有公共子字符串
 *
 * @param str1 第一个字符串
 * @param str2 第二个字符串
 * @param minSubstrLen 最小子字符串长度（默认为2）
 * @returns 是否有公共子字符串
 */
export const hasCommonSubstring = (
  str1: string,
  str2: string,
  minSubstrLen: number = 2
): boolean => {
  if (str1.length < minSubstrLen || str2.length < minSubstrLen) {
    return false;
  }

  // 查找最长公共子字符串
  const maxLen = Math.max(str1.length, str2.length);
  let found = false;

  for (let len = maxLen; len >= minSubstrLen && !found; len--) {
    for (let i = 0; i <= str1.length - len && !found; i++) {
      const substr = str1.substring(i, i + len);
      if (str2.includes(substr)) {
        found = true;
      }
    }
  }

  return found;
};

/**
 * 计算综合匹配分数
 *
 * 结合多种因素：
 * 1. 编辑距离相似度（权重：0.6）
 * 2. 子字符串包含（权重：0.3）
 * 3. 长度差异惩罚（权重：0.1）
 *
 * @param input 用户输入
 * @param candidate 候选短语
 * @returns 匹配分数（0-1）
 */
export const calculateMatchScore = (input: string, candidate: string): number => {
  // 1. 编辑距离相似度
  const similarity = calculateSimilarity(input, candidate);

  // 2. 子字符串包含
  let substringBonus = 0;
  if (containsSubstring(candidate, input)) {
    // 如果候选短语包含用户输入，给予额外分数
    const inputRatio = input.length / candidate.length;
    // 输入占候选短语的比例越大，分数越高
    substringBonus = Math.min(0.3, inputRatio * 0.5);
  } else if (hasCommonSubstring(input, candidate, 2)) {
    // 如果有公共子字符串，给予较小分数
    substringBonus = 0.1;
  }

  // 3. 长度差异惩罚
  const lenDiff = Math.abs(input.length - candidate.length);
  const maxLen = Math.max(input.length, candidate.length);
  const lengthPenalty = Math.min(0.2, lenDiff / maxLen * 0.2);

  // 综合分数
  let score = similarity * 0.6 + substringBonus - lengthPenalty;

  // 确保分数在 0-1 之间
  return Math.max(0, Math.min(1, score));
};

/**
 * 模糊匹配用户输入和短语库
 *
 * @param input 用户输入
 * @param sourceLang 源语言
 * @param threshold 相似度阈值（默认 0.7）
 * @returns 最佳匹配结果，如果没有匹配返回 null
 */
export const fuzzyMatch = (
  input: string,
  sourceLang: Language,
  threshold: number = 0.7
): MatchResult | null => {
  // 输入验证
  if (!input || input.trim().length === 0) {
    return null;
  }

  const trimmedInput = input.trim();
  const index = getPhraseIndex();

  // 如果索引未初始化，返回 null
  if (!index) {
    console.warn('Phrase index not initialized. Call initPhraseIndex() first.');
    return null;
  }

  // 优化：使用首字符索引缩小搜索范围
  let candidates: Phrase[] = [];
  const firstChar = trimmedInput[0];

  if (sourceLang === 'zh') {
    candidates = index.getByZhFirstChar(firstChar);
  } else if (sourceLang === 'ko') {
    candidates = index.getByKoFirstChar(firstChar);
  }

  // 如果首字符匹配结果太少，使用全部短语
  if (candidates.length < 5) {
    candidates = index.getAll();
  }

  // 计算每个候选短语的匹配分数
  const matches: Array<{ phrase: Phrase; score: number; matchedLang: Language }> = [];

  for (const phrase of candidates) {
    let score = 0;
    let matchedLang: Language = sourceLang;

    // 根据源语言选择匹配字段
    if (sourceLang === 'zh') {
      score = calculateMatchScore(trimmedInput, phrase.zh);
      matchedLang = 'zh';
    } else if (sourceLang === 'ko') {
      score = calculateMatchScore(trimmedInput, phrase.ko);
      matchedLang = 'ko';
    }

    // 只保留高于阈值的匹配
    if (score >= threshold) {
      matches.push({ phrase, score, matchedLang });
    }
  }

  // 如果没有匹配，尝试部分匹配（降低阈值）
  if (matches.length === 0 && threshold > 0.5) {
    return fuzzyMatch(input, sourceLang, threshold * 0.8);
  }

  // 返回分数最高的匹配
  if (matches.length > 0) {
    matches.sort((a, b) => b.score - a.score);
    const best = matches[0];

    return {
      phrase: best.phrase,
      similarity: best.score,
      matchedLang: best.matchedLang,
    };
  }

  return null;
};

/**
 * 批量模糊匹配
 *
 * @param inputs 用户输入数组
 * @param sourceLang 源语言
 * @param threshold 相似度阈值
 * @returns 匹配结果数组
 */
export const batchFuzzyMatch = (
  inputs: string[],
  sourceLang: Language,
  threshold: number = 0.7
): Array<MatchResult | null> => {
  return inputs.map(input => fuzzyMatch(input, sourceLang, threshold));
};

/**
 * 查找相似的短语（用于推荐）
 *
 * @param input 用户输入
 * @param sourceLang 源语言
 * @param limit 返回结果数量限制
 * @returns 相似短语列表（按相似度降序）
 */
export const findSimilarPhrases = (
  input: string,
  sourceLang: Language,
  limit: number = 5
): MatchResult[] => {
  if (!input || input.trim().length === 0) {
    return [];
  }

  const trimmedInput = input.trim();
  const index = getPhraseIndex();

  if (!index) {
    return [];
  }

  const candidates = index.getAll();
  const matches: MatchResult[] = [];

  for (const phrase of candidates) {
    let score = 0;
    let matchedLang: Language = sourceLang;

    if (sourceLang === 'zh') {
      score = calculateMatchScore(trimmedInput, phrase.zh);
      matchedLang = 'zh';
    } else if (sourceLang === 'ko') {
      score = calculateMatchScore(trimmedInput, phrase.ko);
      matchedLang = 'ko';
    }

    // 包含所有分数 > 0.3 的结果
    if (score > 0.3) {
      matches.push({
        phrase,
        similarity: score,
        matchedLang,
      });
    }
  }

  // 按相似度降序排序，返回前 limit 个
  matches.sort((a, b) => b.similarity - a.similarity);
  return matches.slice(0, limit);
};

/**
 * 清空短语索引
 */
export const clearPhraseIndex = (): void => {
  phraseIndex = null;
};
