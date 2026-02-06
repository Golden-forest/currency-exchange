import { NextRequest, NextResponse } from 'next/server';
import { ALL_PHRASES } from '@/data/phraseLibrary';
import { fuzzyMatch, initPhraseIndex } from '@/utils/textMatcher';
import type { Phrase } from '@/types/translation';

/**
 * 翻译 API 路由
 *
 * @description 提供服务端翻译接口,保护 DeepSeek API Key 不暴露给客户端
 * 优化策略:
 * 1. 优先使用离线短语库(快速响应 < 50ms)
 * 2. 降级到 DeepSeek API(处理复杂句子)
 */

interface TranslateRequest {
  text: string;
  sourceLang?: string;
  targetLang?: string;
  autoDetect?: boolean;
}

// 初始化短语库索引
let isPhraseIndexInitialized = false;
const initializePhraseIndex = () => {
  if (!isPhraseIndexInitialized) {
    initPhraseIndex(ALL_PHRASES);
    isPhraseIndexInitialized = true;
  }
};

/**
 * 搜索离线短语库
 */
const searchOfflinePhrases = (text: string, sourceLang: 'zh' | 'ko'): Phrase | null => {
  initializePhraseIndex();
  const OFFLINE_MATCH_THRESHOLD = 0.8;
  const matchResult = fuzzyMatch(text, sourceLang, OFFLINE_MATCH_THRESHOLD);
  return matchResult && matchResult.similarity >= OFFLINE_MATCH_THRESHOLD ? matchResult.phrase : null;
};

interface DeepSeekMessage {
  role: 'system' | 'user';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * 自动检测翻译
 */
async function translateAutoDetect(text: string): Promise<{
  translatedText: string;
  detectedSourceLang: string;
  romanization?: string;
}> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DeepSeek API 密钥未配置');
  }

  const systemPrompt = `你是一个智能翻译助手,专门处理中文和韩文之间的翻译。
你的任务是:
1. 自动检测输入文本的语言(中文或韩文)
2. 将其翻译成另一种语言
3. 为韩文提供罗马音标注(仅当目标语言是韩文时)

请严格按照以下 JSON 格式返回:
{
  "translatedText": "翻译后的文本",
  "detectedSourceLang": "检测到的源语言(zh或ko)",
  "romanization": "罗马音标注(仅韩文需要,否则为空字符串)"
}

示例:
输入: "你好"
输出: {"translatedText": "안녕하세요", "detectedSourceLang": "zh", "romanization": ""}

输入: "안녕하세요"
输出: {"translatedText": "你好", "detectedSourceLang": "ko", "romanization": "annyeonghaseyo"}`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API 错误: ${response.status} - ${errorText}`);
    }

    const data: DeepSeekResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('DeepSeek API 返回空响应');
    }

    // 解析 JSON 响应
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    throw error;
  }
}

/**
 * 普通翻译
 */
async function translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DeepSeek API 密钥未配置');
  }

  const langMap: Record<string, string> = {
    'zh': '中文',
    'ko': '韩文',
    'en': '英文',
  };

  const systemPrompt = `你是一个专业的${langMap[targetLang] || targetLang}翻译助手。
请将以下${langMap[sourceLang] || sourceLang}文本翻译成${langMap[targetLang] || targetLang}。
只返回翻译结果,不要添加任何解释或说明。`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API 错误: ${response.status} - ${errorText}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    throw error;
  }
}

/**
 * POST 请求处理
 */
export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, sourceLang, targetLang, autoDetect } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '请提供要翻译的文本' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();

    if (autoDetect) {
      // 自动检测翻译 - 先尝试离线短语
      const detectedLang = /^[\u3131-\u3163\uac00-\ud7a3]/.test(trimmedText) ? 'ko' : 'zh';

      // 优先尝试离线短语库
      const matchedPhrase = searchOfflinePhrases(trimmedText, detectedLang);
      if (matchedPhrase) {
        const targetText = detectedLang === 'zh' ? matchedPhrase.ko : matchedPhrase.zh;
        return NextResponse.json({
          translatedText: targetText,
          detectedSourceLang: detectedLang,
          romanization: detectedLang === 'zh' ? matchedPhrase.romanization : undefined,
          isOffline: true,
        });
      }

      // 离线短语未匹配,调用 DeepSeek API
      const result = await translateAutoDetect(trimmedText);
      return NextResponse.json({
        ...result,
        isOffline: false,
      });
    } else {
      // 普通翻译
      if (!sourceLang || !targetLang) {
        return NextResponse.json(
          { error: '请指定源语言和目标语言' },
          { status: 400 }
        );
      }

      // 优先尝试离线短语库
      const matchedPhrase = searchOfflinePhrases(trimmedText, sourceLang as 'zh' | 'ko');
      if (matchedPhrase) {
        const targetText = targetLang === 'zh' ? matchedPhrase.zh : matchedPhrase.ko;
        return NextResponse.json({
          translatedText: targetText,
          romanization: targetLang === 'ko' ? matchedPhrase.romanization : undefined,
          isOffline: true,
        });
      }

      // 离线短语未匹配,调用 DeepSeek API
      const translatedText = await translate(trimmedText, sourceLang, targetLang);
      return NextResponse.json({
        translatedText,
        isOffline: false,
      });
    }
  } catch (error) {
    console.error('翻译 API 错误:', error);
    return NextResponse.json(
      {
        error: '翻译服务暂时不可用',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
