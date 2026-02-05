/**
 * 语音识别功能使用示例
 *
 * 这个文件展示了如何使用 Phase 2 实现的语音识别功能
 * 注意：这是一个示例文件，不是实际的测试文件
 */

'use client';

import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

/**
 * 示例 1: 基础使用
 */
export function BasicExample() {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  if (!isSupported) {
    return <div>您的浏览器不支持语音识别功能</div>;
  }

  return (
    <div>
      <h2>语音识别示例</h2>

      {/* 状态显示 */}
      <div>
        {isListening ? (
          <span style={{ color: 'red' }}>🔴 正在录音...</span>
        ) : (
          <span style={{ color: 'gray' }}>⚪ 未开始</span>
        )}
      </div>

      {/* 控制按钮 */}
      <button
        onClick={() => startListening('zh')}
        disabled={isListening}
      >
        开始录音（中文）
      </button>

      <button
        onClick={() => startListening('ko')}
        disabled={isListening}
      >
        开始录音（韩语）
      </button>

      <button
        onClick={stopListening}
        disabled={!isListening}
      >
        停止录音
      </button>

      <button onClick={resetTranscript}>
        清空文本
      </button>

      {/* 识别结果 */}
      <div>
        <h3>识别结果：</h3>
        <p>最终结果：{transcript || '(暂无)'}</p>
        <p>临时结果：{interimTranscript || '(暂无)'}</p>
      </div>

      {/* 错误显示 */}
      {error && (
        <div style={{ color: 'red' }}>
          错误：{error}
        </div>
      )}
    </div>
  );
}

/**
 * 示例 2: 集成翻译功能
 */
export function TranslationExample() {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    initialLang: 'zh',
    onTranscriptComplete: (text, lang) => {
      console.log('识别完成:', { text, lang });
      // 这里可以调用翻译 API
      // 例如: translate(text, lang, 'ko');
    },
    onInterimResult: (transcript, interim) => {
      console.log('临时结果:', { transcript, interim });
    },
  });

  // 模拟翻译结果
  const [translatedText, setTranslatedText] = useState('');

  const handleTranslate = async (text: string) => {
    // 调用 Phase 1 的翻译功能
    // const result = await translateText(text, 'zh', 'ko');
    // setTranslatedText(result.translatedText);
  };

  return (
    <div>
      <h2>语音翻译示例</h2>

      <button onClick={() => startListening('zh')}>
        🎤 说话并翻译（中文 → 韩语）
      </button>

      <button onClick={stopListening}>
        ⏹️ 停止
      </button>

      <div>
        <h3>中文输入：</h3>
        <p>{transcript || interimTranscript || '请开始说话...'}</p>
      </div>

      <div>
        <h3>韩语翻译：</h3>
        <p>{translatedText || '等待翻译...'}</p>
      </div>
    </div>
  );
}

/**
 * 示例 3: 自定义 UI
 */
export function CustomUIExample() {
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    clearError,
  } = useSpeechRecognition({
    autoClear: true, // 自动清空之前的文本
  });

  return (
    <div className="speech-recognition-container">
      {/* 录音按钮 */}
      <button
        className={`mic-button ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : () => startListening('zh')}
      >
        {isListening ? '⏹️' : '🎤'}
      </button>

      {/* 录音状态指示器 */}
      {isListening && (
        <div className="recording-indicator">
          <span className="pulse"></span>
          正在录音...
        </div>
      )}

      {/* 识别结果 */}
      <textarea
        value={transcript}
        readOnly
        placeholder="识别的文字将显示在这里"
      />

      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}
    </div>
  );
}

// 导入 useState
import { useState } from 'react';
