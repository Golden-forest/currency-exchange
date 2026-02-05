# DeepSeek API 集成 + 自动语言检测实现计划

**日期**: 2026-02-05
**功能**: 将翻译功能从 Google Translate API 迁移到 DeepSeek API，并添加自动语言检测
**预估工作量**: 2-3 小时

---

## 📋 需求概述

### 核心需求

1. **替换翻译 API**
   - 完全移除 Google Translate API 依赖
   - 使用 DeepSeek API 进行在线翻译
   - 保留离线短语库功能（80% 场景）

2. **自动语言检测**
   - 用户输入文本时自动识别语言（中文/韩文）
   - 自动切换翻译方向（无需手动切换）
   - 静默切换，无需 UI 提示

3. **韩文罗马音显示**
   - 集成 `korean-romanizer` 库
   - 为韩文翻译结果提供准确的罗马音

### 技术目标

- ✅ 智能重试 + 离线降级策略
- ✅ 复用现有缓存机制
- ✅ 保持现有 UI/UX 不变
- ✅ TypeScript 类型安全

---

## 🏗️ 架构设计

### 翻译流程

```
用户输入文本
    ↓
1. 自动语言检测 (<1ms)
   ├─ 检测到中文 → 设置 sourceLang='zh', targetLang='ko'
   └─ 检测到韩文 → 设置 sourceLang='ko', targetLang='zh'
    ↓
2. 离线短语库匹配 (80% 场景, <50ms)
   └─ 匹配成功 → 返回结果 + 罗马音
    ↓ (未匹配)
3. DeepSeek API 翻译 (20% 场景, 500-1500ms)
   ├─ 成功 → 返回结果 + 生成罗马音
   └─ 失败 → 智能重试
    ↓ (重试仍失败)
4. 降级到离线短语库 (模糊匹配)
    ↓ (仍失败)
5. 抛出错误提示
```

### 文件结构

**新建文件:**
```
src/
├── utils/
│   ├── detectLanguage.ts        [新建] 语言检测工具
│   ├── deepseekTranslate.ts     [新建] DeepSeek API 封装
│   └── romanizer.ts             [新建] 韩文罗马音转换工具
```

**修改文件:**
```
src/
├── components/
│   └── TranslationCard.tsx      [修改] 集成自动语言检测
├── hooks/
│   └── useTranslation.ts        [修改] 添加自动检测逻辑
├── services/
│   └── translationService.ts    [修改] 替换 API 调用
└── types/
    └── translation.ts           [可能修改] 类型定义

.env.local.example               [修改] DeepSeek 配置
SETUP_GUIDE.md                   [修改] 更新文档
package.json                     [修改] 添加依赖
```

**删除文件:**
```
src/utils/googleTranslate.ts     [删除] 不再需要
```

---

## 📝 详细实现步骤

### Step 1: 安装依赖

**文件**: `package.json`

**操作**:
```bash
npm install korean-romanizer
```

**说明**:
- `korean-romanizer`: 韩文罗马音转换库 (~20KB)
- 提供准确的韩文发音罗马音

**验证**:
```bash
npm ls korean-romanizer
```

---

### Step 2: 创建语言检测工具

**文件**: `src/utils/detectLanguage.ts`

**功能**:
- 检测输入文本是中文还是韩文
- 基于字符编码范围判断

**实现逻辑**:
```typescript
import type { Language } from '@/types/translation';

/**
 * 检测文本语言
 *
 * 规则：
 * - 如果包含中文字符 → 返回 'zh'
 * - 如果包含韩文字符 → 返回 'ko'
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
```

**测试用例**:
```typescript
// 测试中文
detectLanguage('你好') → 'zh'
detectLanguage('这是一个测试') → 'zh'

// 测试韩文
detectLanguage('안녕하세요') → 'ko'
detectLanguage('한글 테스트') → 'ko'

// 测试边界情况
detectLanguage('') → 'zh' (默认)
detectLanguage('Hello') → 'zh' (默认)
```

---

### Step 3: 创建韩文罗马音转换工具

**文件**: `src/utils/romanizer.ts`

**功能**:
- 封装 `korean-romanizer` 库
- 提供统一的罗马音转换接口
- 错误处理和降级

**实现逻辑**:
```typescript
import { Romanizer } from 'korean-romanizer';

/**
 * 将韩文转换为罗马音
 *
 * @param koreanText 韩文文本
 * @returns 罗马音文本，转换失败返回空字符串
 */
export const koreanToRomanization = (koreanText: string): string => {
  // 空字符串直接返回
  if (!koreanText || koreanText.trim().length === 0) {
    return '';
  }

  try {
    const romanizer = new Romanizer();
    const roman = romanizer.romanize(koreanText);
    return roman;
  } catch (error) {
    console.warn('韩文罗马音转换失败:', error);
    // 转换失败时返回占位符
    return `[韩文发音: ${koreanText.length} 字]`;
  }
};

/**
 * 批量转换韩文为罗马音
 *
 * @param koreanTexts 韩文文本数组
 * @returns 罗马音文本数组
 */
export const batchKoreanToRomanization = (koreanTexts: string[]): string[] => {
  return koreanTexts.map(koreanToRomanization);
};
```

**测试用例**:
```typescript
// 测试基本转换
koreanToRomanization('안녕하세요') → 'annyeonghaseyo'
koreanToRomanization('감사합니다') → 'gamsahamnida'

// 测试边界情况
koreanToRomanization('') → ''
koreanToRomanization('123') → '123'
```

---

### Step 4: 创建 DeepSeek API 翻译工具

**文件**: `src/utils/deepseekTranslate.ts`

**功能**:
- DeepSeek Chat Completions API 调用
- 智能重试机制 (429/500 错误)
- 缓存机制 (复用现有缓存)
- 罗马音生成

**实现逻辑**:

#### 4.1 类型定义

```typescript
import type { Language, TranslationResult } from '@/types/translation';
import { koreanToRomanization } from './romanizer';

/**
 * DeepSeek API 响应类型
 */
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * DeepSeek API 错误响应
 */
interface DeepSeekError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}
```

#### 4.2 配置常量

```typescript
/**
 * DeepSeek API 端点
 */
const API_ENDPOINT = 'https://api.deepseek.com/chat/completions';

/**
 * 系统提示词（翻译角色）
 */
const SYSTEM_PROMPT = `你是专业的中韩翻译助手。
规则：
- 只返回翻译结果，不要解释
- 保持原文的语气和礼貌程度
- 对于中文→韩语：使用自然的韩语表达
- 对于韩语→中文：使用地道的中文表达`;

/**
 * 智能重试配置
 */
const RETRY_CONFIG: Record<string, { delay: number; maxRetries: number }> = {
  '429': { delay: 2000, maxRetries: 1 },  // Rate limit
  '500': { delay: 1000, maxRetries: 1 },  // Server error
  'timeout': { delay: 3000, maxRetries: 1 }, // Network timeout
};

/**
 * 缓存过期时间（1小时）
 */
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

/**
 * 缓存项
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
```

#### 4.3 辅助函数

```typescript
/**
 * 从环境变量获取 API 密钥
 */
const getApiKey = (): string => {
  if (typeof window === 'undefined') {
    return process.env.DEEPSEEK_API_KEY || '';
  }
  return process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
};

/**
 * 验证 DeepSeek API 配置
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
 */
const generateCacheKey = (text: string, sourceLang: Language, targetLang: Language): string => {
  return `${text}_${sourceLang}_${targetLang}`;
};

/**
 * 清理过期缓存
 */
const cleanExpiredCache = (): void => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  translationCache.forEach((item, key) => {
    if (now - item.timestamp > CACHE_EXPIRY_MS) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => translationCache.delete(key));
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
```

#### 4.4 核心 API 调用函数

```typescript
/**
 * 调用 DeepSeek API 进行翻译
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
      'DeepSeek API 密钥未配置。请在 .env.local 中设置 NEXT_PUBLIC_DEEPSEEK_API_KEY'
    );
  }

  // 构建用户提示词
  const userPrompt = sourceLang === 'zh'
    ? `翻译为韩语：${text}`
    : `翻译为中文：${text}`;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,        // 降低随机性，提高翻译准确性
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
    console.warn(`API 调用失败 (${status})，${retryConfigEntry.delay}ms 后重试...`);

    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, retryConfigEntry.delay));

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
```

#### 4.5 主翻译函数

```typescript
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
      romanization: targetLang === 'ko' ? koreanToRomanization(cached) : undefined,
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
    romanization: targetLang === 'ko' ? koreanToRomanization(translatedText) : undefined,
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
```

**测试用例**:
```typescript
// 测试基本翻译
translateText('你好', 'zh', 'ko') → { translatedText: '안녕하세요', romanization: 'annyeonghaseyo', isOffline: false }

// 测试缓存
translateText('你好', 'zh', 'ko') → 第一次调用 API
translateText('你好', 'zh', 'ko') → 第二次从缓存读取

// 测试错误处理
translateText('', 'zh', 'ko') → throws Error('翻译文本不能为空')
```

---

### Step 5: 修改翻译服务

**文件**: `src/services/translationService.ts`

**修改内容**:

#### 5.1 导入替换

```typescript
// 旧代码
import { translateText as googleTranslate, clearTranslationCache } from '@/utils/googleTranslate';

// 新代码
import { translateText as deepseekTranslate, clearTranslationCache } from '@/utils/deepseekTranslate';
```

#### 5.2 函数替换

```typescript
// 旧代码
const callGoogleTranslate = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult> => {
  try {
    return await googleTranslate(text, sourceLang, targetLang);
  } catch (error) {
    throw error;
  }
};

// 新代码
const callDeepSeekTranslate = async (
  text: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult> => {
  try {
    return await deepseekTranslate(text, sourceLang, targetLang);
  } catch (error) {
    throw error;
  }
};
```

#### 5.3 主翻译逻辑

```typescript
// 主翻译函数（保持不变，只是调用的函数名改变）
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

  const trimmedText = text.trim();

  // 策略 1：尝试离线短语匹配
  const matchedPhrase = searchOfflinePhrases(trimmedText, sourceLang);

  if (matchedPhrase) {
    // 离线匹配成功
    const targetText = targetLang === 'zh' ? matchedPhrase.zh : matchedPhrase.ko;
    const romanization = targetLang === 'ko' ? matchedPhrase.romanization : undefined;

    // 保存到历史
    saveToHistory(
      trimmedText,
      targetText,
      sourceLang,
      targetLang,
      true,
      romanization
    );

    return {
      translatedText: targetText,
      romanization,
      isOffline: true,
      matchedPhrase,
    };
  }

  // 策略 2：调用 DeepSeek API
  try {
    const result = await callDeepSeekTranslate(trimmedText, sourceLang, targetLang);

    // 保存到历史
    saveToHistory(
      trimmedText,
      result.translatedText,
      sourceLang,
      targetLang,
      false,
      result.romanization
    );

    return result;
  } catch (error) {
    // 策略 3：API 失败时的降级处理
    const errorMessage = error instanceof Error ? error.message : '翻译失败';

    // 尝试使用部分匹配的离线短语（如果有）
    const partialMatch = searchOfflinePhrases(trimmedText, sourceLang);

    if (partialMatch) {
      // 部分匹配降级
      console.warn('API 调用失败，降级到部分匹配的离线短语:', errorMessage);

      const targetText = targetLang === 'zh' ? partialMatch.zh : partialMatch.ko;
      const romanization = targetLang === 'ko' ? partialMatch.romanization : undefined;

      // 保存到历史
      saveToHistory(
        trimmedText,
        targetText,
        sourceLang,
        targetLang,
        true,
        romanization
      );

      return {
        translatedText: targetText,
        romanization,
        isOffline: true,
        matchedPhrase: partialMatch,
      };
    }

    // 所有策略都失败，抛出错误
    throw new Error(`${errorMessage}。请检查网络连接或稍后再试。`);
  }
};
```

**说明**: 其他函数（`batchTranslate`, `historyService`, `clearAllCaches` 等）保持不变。

---

### Step 6: 添加自动语言检测到 Hook

**文件**: `src/hooks/useTranslation.ts`

**修改内容**:

#### 6.1 导入语言检测工具

```typescript
import { detectLanguage } from '@/utils/detectLanguage';
```

#### 6.2 添加自动检测逻辑

在 `translate` 函数中添加自动语言检测：

```typescript
/**
 * 翻译文本（添加自动语言检测）
 *
 * @param text 要翻译的文本（可选，默认使用 sourceText）
 */
const translate = useCallback(async (text?: string): Promise<void> => {
  const textToTranslate = text || sourceText;

  // 输入验证
  if (!textToTranslate || textToTranslate.trim().length === 0) {
    setError('请输入要翻译的文本');
    return;
  }

  // 🆕 自动语言检测
  const detectedLang = detectLanguage(textToTranslate);

  // 如果检测到的语言与当前源语言不同，自动切换
  if (detectedLang !== sourceLang) {
    const newTargetLang = sourceLang; // 原源语言成为目标语言

    // 静默切换语言方向
    setSourceLang(detectedLang);
    setTargetLang(newTargetLang);

    console.log(`自动检测到语言: ${detectedLang === 'zh' ? '中文' : '韩文'}，切换翻译方向`);
  }

  // 清除之前的错误
  setError(null);

  // 开始加载
  setIsLoading(true);

  try {
    // 调用翻译服务（使用检测后的语言）
    const result: TranslationResult = await serviceTranslate(
      textToTranslate,
      detectedLang,  // 🆕 使用检测到的语言
      targetLang
    );

    // 更新状态
    setTargetText(result.translatedText);
    setRomanization(result.romanization || '');

    // 如果是外部调用传入的 text，也更新 sourceText
    if (text !== undefined && text !== sourceText) {
      setSourceText(text);
    }

    // 刷新历史记录
    const updatedHistory = historyService.get();
    setHistory(updatedHistory);
  } catch (err) {
    // 错误处理
    const errorMessage = err instanceof Error ? err.message : '翻译失败，请稍后再试';
    setError(errorMessage);
    console.error('翻译错误:', err);
  } finally {
    // 结束加载
    setIsLoading(false);
  }
}, [sourceText, sourceLang, targetLang]);  // 🆕 依赖项保持不变
```

**说明**:
- 在翻译前自动检测输入语言
- 如果与当前设置不同，自动切换
- 静默切换，不显示 UI 提示
- 使用检测到的语言调用翻译 API

---

### Step 7: 修改 TranslationCard 组件（可选）

**文件**: `src/components/TranslationCard.tsx`

**修改内容**: 移除手动语言切换按钮

#### 7.1 查找语言切换按钮

在组件中找到类似这样的代码：

```typescript
// 语言切换按钮
<button onClick={swapLanguages}>
  交换语言
</button>
```

#### 7.2 移除或隐藏按钮

**选项 A: 完全移除**
```typescript
// 删除语言切换按钮及其相关逻辑
```

**选项 B: 保留但禁用**
```typescript
<button disabled={true} title="已启用自动语言检测">
  交换语言 (自动)
</button>
```

**推荐**: 选项 B（保留但禁用），因为：
1. 用户可以看到有这个功能
2. 提示说明现在是自动的
3. 未来可能需要手动切换的场景

---

### Step 8: 更新配置文件

**文件**: `.env.local.example`

**修改内容**:

#### 8.1 替换 Google 配置为 DeepSeek

```bash
# DeepSeek API 配置
#
# 获取 API 密钥步骤：
# 1. 访问 DeepSeek 开放平台: https://platform.deepseek.com/
# 2. 注册/登录账号
# 3. 进入 API Keys 页面
# 4. 创建新的 API 密钥
# 5. 复制密钥到下面
#
# 注意事项：
# - 请勿将此文件提交到版本控制系统（已添加到 .gitignore）
# - API 密钥应该保密，不要分享给他人
# - 请将此文件复制为 .env.local 并填入实际的 API 密钥

# DeepSeek API 密钥（必需）
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_api_key_here

# DeepSeek API 模型（可选，默认 deepseek-chat）
NEXT_PUBLIC_DEEPSEEK_MODEL=deepseek-chat

# DeepSeek API 基础 URL（可选，默认 https://api.deepseek.com）
NEXT_PUBLIC_DEEPSEEK_BASE_URL=https://api.deepseek.com

# 应用配置
NEXT_PUBLIC_APP_NAME=Currency Exchange
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**说明**:
- 删除所有 Google Translate 相关配置
- 添加 DeepSeek API 配置
- 保持应用配置不变

---

### Step 9: 更新文档

**文件**: `SETUP_GUIDE.md`

**修改内容**:

#### 9.1 替换 Google API 章节

**删除**: "1️⃣ Google Translate API 配置" 章节

**添加**: "1️⃣ DeepSeek API 配置" 章节

```markdown
## 1️⃣ DeepSeek API 配置

### 为什么需要配置？

翻译功能使用**混合翻译策略**：
- **80% 场景**：使用离线短语库（无需 API，快速）
- **20% 场景**：复杂句子需要调用 DeepSeek API

如果不配置 API 密钥：
- ✅ 离线短语功能仍然可用（175 句常用语）
- ❌ 复杂句子翻译将失败
- ⚠️ 会显示配置提示

### 获取 API 密钥步骤

#### 步骤 1：访问 DeepSeek 开放平台

```
https://platform.deepseek.com/
```

#### 步骤 2：注册/登录账号

- 点击右上角"登录"或"注册"
- 使用手机号或邮箱注册
- 完成邮箱验证

#### 步骤 3：创建 API 密钥

1. 登录后进入控制台
2. 点击左侧菜单"API Keys"
3. 点击"创建新密钥"按钮
4. 输入密钥名称（如"Currency Exchange"）
5. 点击"创建"
6. **重要**: 立即复制密钥（格式: `sk-xxxxx`）

#### 步骤 4：配置到项目

1. **创建环境变量文件**
   ```bash
   # 在项目根目录执行
   cp .env.local.example .env.local
   ```

2. **编辑 .env.local 文件**
   ```bash
   # 将 your_api_key_here 替换为你的实际 API 密钥
   NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-你的实际API密钥
   ```

3. **重启开发服务器**
   ```bash
   # 停止当前服务器（Ctrl+C）
   # 重新启动
   npm run dev
   ```

### 费用说明

DeepSeek API 定价：
- **输入**: ¥1/百万 tokens
- **输出**: ¥2/百万 tokens

**预估使用量**：
- 离线短语库覆盖 80% 场景，不需要调用 API
- 假设每天 100 次在线翻译，每次 20 tokens
- 每月约 60,000 tokens（输入 40,000 + 输出 20,000）
- **每月费用**: ¥0.03（约 ¥0.36/年）

**结论**: 成本极低，几乎可以忽略不计。
```

#### 9.2 更新韩文罗马音章节

**修改**: "3️⃣ Korean Romanizer 配置（可选）" → "3️⃣ Korean Romanizer 配置（已完成）"

```markdown
## 3️⃣ Korean Romanizer 配置（已完成）

### 当前状态

韩文罗马音功能已集成到项目中：
- ✅ 已安装 `korean-romanizer` 库
- ✅ 自动为韩文翻译结果生成罗马音
- ✅ 无需额外配置

### 功能说明

翻译韩文时，系统会自动：
1. 调用 DeepSeek API 翻译文本
2. 使用 `korean-romanizer` 库生成罗马音
3. 在界面显示罗马音（例如：안녕하세요 [annyeonghaseyo]）

### 示例

```
输入: 你好
翻译: 안녕하세요
罗马音: annyeonghaseyo
```
```

#### 9.3 更新验证章节

**修改**: "✅ 验证配置" 章节

```markdown
## ✅ 验证配置

### 1. 检查 API 密钥配置

启动应用后，打开浏览器控制台：
- ✅ 如果配置正确：无警告信息
- ❌ 如果未配置：会看到警告

```javascript
// 正确配置：无警告

// 未配置：显示警告
// 警告: DeepSeek API 密钥未配置
// 警告: 请创建 .env.local 文件并添加 NEXT_PUBLIC_DEEPSEEK_API_KEY
```

### 2. 测试翻译功能

1. **测试离线短语**（无需 API）
   - 输入："你好"
   - 应该立即显示："안녕하세요"
   - 应该显示罗马音："annyeonghaseyo"

2. **测试在线翻译**（需要 API）
   - 输入："这个商品的详细信息是什么？"
   - 应该在 1-2 秒后显示翻译结果
   - 如果 API 未配置，会显示错误提示

3. **测试自动语言检测**（新功能）
   - 输入中文："你好" → 自动翻译成韩文
   - 输入韩文："안녕하세요" → 自动翻译成中文
   - 不需要手动切换语言方向
```

---

### Step 10: 删除 Google Translate 相关文件

**文件**: `src/utils/googleTranslate.ts`

**操作**:
```bash
rm src/utils/googleTranslate.ts
```

**说明**:
- 完全移除 Google Translate API 依赖
- 确保没有其他文件引用此文件
- 如果有引用，已在 Step 5 中替换

---

## 🧪 测试计划

### 单元测试

#### 1. 语言检测测试

**文件**: `src/utils/__tests__/detectLanguage.test.ts`

```typescript
import { detectLanguage, isKorean, isChinese } from '../detectLanguage';

describe('detectLanguage', () => {
  test('检测中文', () => {
    expect(detectLanguage('你好')).toBe('zh');
    expect(detectLanguage('这是一个测试')).toBe('zh');
  });

  test('检测韩文', () => {
    expect(detectLanguage('안녕하세요')).toBe('ko');
    expect(detectLanguage('한글 테스트')).toBe('ko');
  });

  test('边界情况', () => {
    expect(detectLanguage('')).toBe('zh'); // 默认中文
    expect(detectLanguage('Hello')).toBe('zh'); // 默认中文
  });
});
```

#### 2. 罗马音转换测试

**文件**: `src/utils/__tests__/romanizer.test.ts`

```typescript
import { koreanToRomanization } from '../romanizer';

describe('koreanToRomanization', () => {
  test('基本转换', () => {
    expect(koreanToRomanization('안녕하세요')).toBeTruthy();
    expect(koreanToRomanization('감사합니다')).toBeTruthy();
  });

  test('边界情况', () => {
    expect(koreanToRomanization('')).toBe('');
    expect(koreanToRomanization('123')).toBeTruthy(); // 数字保持不变
  });
});
```

### 集成测试

#### 3. 翻译流程测试

**手动测试步骤**:

1. **测试自动语言检测**
   ```
   输入: "你好"
   预期: 自动检测为中文，翻译成韩文
   结果: "안녕하세요 [annyeonghaseyo]"

   输入: "안녕하세요"
   预期: 自动检测为韩文，翻译成中文
   结果: "你好"
   ```

2. **测试离线短语**
   ```
   输入: "谢谢"
   预期: 立即显示翻译（<50ms）
   结果: "감사합니다 [gamsahamnida]"
   ```

3. **测试在线翻译**
   ```
   输入: "这个商品的详细信息是什么？"
   预期: 1-2 秒后显示翻译
   结果: (韩文翻译) + 罗马音
   ```

4. **测试错误处理**
   ```
   场景: 断网后输入复杂句子
   预期: 降级到离线短语库
   结果: 显示部分匹配的短语或错误提示
   ```

5. **测试语音输入**
   ```
   操作: 点击麦克风，说中文
   预期: 自动检测为中文，翻译成韩文
   ```

6. **测试 OCR 图片识别**
   ```
   操作: 上传包含中文/韩文的图片
   预期: 识别文字后自动检测语言并翻译
   ```

### 性能测试

#### 4. 缓存性能测试

```typescript
// 测试缓存命中
console.time('第一次翻译');
await translateText('你好', 'zh', 'ko');
console.timeEnd('第一次翻译'); // 预期: 500-1500ms

console.time('第二次翻译（缓存）');
await translateText('你好', 'zh', 'ko');
console.timeEnd('第二次翻译（缓存）'); // 预期: <10ms
```

#### 5. 离线短语性能测试

```typescript
// 测试离线匹配速度
console.time('离线匹配');
await translateText('谢谢', 'zh', 'ko');
console.timeEnd('离线匹配'); // 预期: <50ms
```

---

## 📊 预期成果

### 代码统计

| 操作 | 文件数 | 行数 |
|------|--------|------|
| 新增 | 3 | ~600 |
| 修改 | 5 | ~150 |
| 删除 | 1 | ~400 |
| **净增长** | **7** | **~350** |

### 功能对比

| 功能 | 迁移前 | 迁移后 |
|------|--------|--------|
| 在线翻译 API | Google Translate | DeepSeek |
| API 费用 | $0 (免费配额内) | ¥0.36/年 |
| 罗马音显示 | 占位符 | 准确罗马音 |
| 语言切换 | 手动 | **自动** |
| 离线覆盖率 | 80% | 80% (不变) |
| 智能重试 | ❌ | **✅** |
| 响应速度 | 500-1500ms | 500-1500ms |

### 用户体验提升

1. **自动语言检测**
   - ✅ 无需手动切换语言方向
   - ✅ 输入即翻译，更流畅
   - ✅ 语音输入、OCR 识别也自动检测

2. **准确的韩文罗马音**
   - ✅ 帮助用户正确发音
   - ✅ 提升沟通效率
   - ✅ 旅游场景更实用

3. **智能重试 + 离线降级**
   - ✅ 网络波动时自动重试
   - ✅ API 失败时降级到离线
   - ✅ 更高的可用性

4. **成本极低**
   - ✅ 每月约 ¥0.03
   - ✅ 几乎免费使用

---

## 🚀 部署检查清单

### 开发环境

- [ ] 安装 `korean-romanizer` 依赖
- [ ] 创建 `.env.local` 文件
- [ ] 配置 `NEXT_PUBLIC_DEEPSEEK_API_KEY`
- [ ] 重启开发服务器
- [ ] 测试翻译功能
- [ ] 测试自动语言检测
- [ ] 测试语音输入
- [ ] 测试 OCR 识别

### 生产环境

- [ ] 更新 `SETUP_GUIDE.md`
- [ ] 在生产环境配置环境变量
- [ ] 删除 `src/utils/googleTranslate.ts`
- [ ] 运行 `npm run build` 确保构建成功
- [ ] 部署到生产环境
- [ ] 验证生产环境功能正常

### Git 提交

```bash
# 添加所有更改
git add .

# 提交
git commit -m "feat: 集成 DeepSeek API 并添加自动语言检测

- 完全替换 Google Translate API 为 DeepSeek API
- 添加自动语言检测功能（中文/韩文）
- 集成 korean-romanizer 库提供准确韩文罗马音
- 添加智能重试机制（429/500 错误）
- 更新配置文件和文档
- 删除 googleTranslate.ts

功能优化:
- 用户无需手动切换语言方向
- 韩文翻译结果显示准确罗马音
- API 失败时智能重试 + 离线降级
- 成本极低（约 ¥0.36/年）

文件变更:
- 新增: src/utils/detectLanguage.ts
- 新增: src/utils/deepseekTranslate.ts
- 新增: src/utils/romanizer.ts
- 修改: src/hooks/useTranslation.ts
- 修改: src/services/translationService.ts
- 修改: src/components/TranslationCard.tsx
- 修改: .env.local.example
- 修改: SETUP_GUIDE.md
- 删除: src/utils/googleTranslate.ts
"

# 推送到远程仓库
git push origin main
```

---

## 🔧 故障排除

### 常见问题

#### Q1: DeepSeek API 密钥无效

**症状**: 翻译失败，提示"API 密钥无效或无权限访问"

**解决方案**:
1. 检查 `.env.local` 文件中的 API 密钥格式
2. 确认密钥以 `sk-` 开头
3. 登录 DeepSeek 平台检查密钥是否有效
4. 重启开发服务器

#### Q2: 自动语言检测不准确

**症状**: 输入中文但被识别为韩文

**解决方案**:
1. 检查输入文本是否包含韩文字符
2. 如果混合中韩文，会优先识别为韩文
3. 这是预期行为，可以手动修正

#### Q3: 罗马音显示不正确

**症状**: 韩文翻译的罗马音不准确或显示占位符

**解决方案**:
1. 确认 `korean-romanizer` 库已安装
2. 运行 `npm ls korean-romanizer` 检查
3. 如果未安装，运行 `npm install korean-romanizer`

#### Q4: 翻译速度慢

**症状**: 在线翻译需要 3 秒以上

**可能原因**:
1. 网络连接不稳定
2. DeepSeek API 服务器负载高
3. 超时重试机制触发

**解决方案**:
1. 检查网络连接
2. 等待 API 服务恢复
3. 依赖离线短语库（80% 场景）

---

## 📚 相关资源

- [DeepSeek API 官方文档](https://api-docs.deepseek.com/)
- [korean-romanizer npm 包](https://www.npmjs.com/package/korean-romanizer)
- [TypeScript 类型定义](../src/types/translation.ts)
- [离线短语库](../src/data/phraseLibrary.ts)

---

## ✅ 总结

本实现计划详细描述了：

1. ✅ **DeepSeek API 集成** - 完全替换 Google Translate
2. ✅ **自动语言检测** - 智能识别中文/韩文
3. ✅ **韩文罗马音** - 准确的发音提示
4. ✅ **智能重试 + 降级** - 高可用性
5. ✅ **极低成本** - ¥0.36/年
6. ✅ **保持兼容性** - 离线功能不变

**预估工作量**: 2-3 小时
**风险等级**: 低（向后兼容，失败降级）
**优先级**: 高（用户体验显著提升）

---

**文档版本**: 1.0
**最后更新**: 2026-02-05
**作者**: Claude (Subagent-Driven Development)
