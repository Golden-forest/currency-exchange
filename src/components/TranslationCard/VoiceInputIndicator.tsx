'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * VoiceInputIndicator 组件属性
 */
interface VoiceInputIndicatorProps {
  /** 是否正在录音 */
  isListening: boolean;
  /** 临时识别文本（实时更新） */
  interimTranscript: string;
  /** 停止录音回调 */
  onStop?: () => void;
}

/**
 * VoiceInputIndicator 组件
 *
 * 功能：
 * - 显示录音状态的视觉反馈
 * - 圆形脉冲动画（外圈扩散）
 * - 声波效果（多个圆圈依次扩散）
 * - 实时显示识别文本
 * - Neumorphism 设计风格
 * - 响应式设计（移动端适配）
 *
 * @example
 * ```tsx
 * <VoiceInputIndicator
 *   isListening={isListening}
 *   interimTranscript={interimTranscript}
 *   onStop={stopListening}
 * />
 * ```
 */
export function VoiceInputIndicator({
  isListening,
  interimTranscript,
  onStop,
}: VoiceInputIndicatorProps) {
  /** 动画波纹的数量 */
  const [ripples, setRipples] = useState<number[]>([]);

  /**
   * 管理波纹动画
   */
  useEffect(() => {
    if (isListening) {
      // 每隔一段时间添加一个新的波纹
      const interval = setInterval(() => {
        setRipples((prev) => {
          // 最多保留 3 个波纹
          const newRipples = [...prev, Date.now()];
          if (newRipples.length > 3) {
            return newRipples.slice(-3);
          }
          return newRipples;
        });
      }, 800);

      return () => clearInterval(interval);
    } else {
      // 停止录音时清空波纹
      setRipples([]);
    }
  }, [isListening]);

  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center z-20 bg-white/60 backdrop-blur-sm rounded-[3.5rem]"
          role="dialog"
          aria-modal="true"
          aria-label="语音输入界面"
        >
          <div className="flex flex-col items-center gap-6 px-8">
            {/* 录音动画 */}
            <div className="relative flex items-center justify-center" role="status" aria-live="polite">
              {/* 中心麦克风图标 */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative z-10 w-20 h-20 bg-gradient-to-tr from-[#1ABC9C] to-[#2ECC71] rounded-full flex items-center justify-center text-white shadow-glow-primary"
                aria-hidden="true"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>

                {/* 停止按钮（覆盖在中心） */}
                {onStop && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={onStop}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
                    title="停止录音"
                    aria-label="停止录音"
                    type="button"
                  >
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="8" y="8" width="8" height="8" rx="1" />
                    </svg>
                  </motion.button>
                )}
              </motion.div>

              {/* 波纹动画 */}
              {ripples.map((ripple) => (
                <motion.div
                  key={ripple}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                  transition={{ duration: 2.4, ease: 'easeOut' }}
                  className="absolute inset-0 border-4 border-[#1ABC9C]/30 rounded-full"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* 状态文本 */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-base font-bold text-[#1ABC9C]"
                role="status"
                aria-live="polite"
              >
                正在录音...
              </motion.div>

              {/* 实时识别文本 */}
              {interimTranscript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-medium text-[#2D3436] text-center max-w-xs"
                  role="status"
                  aria-live="polite"
                  aria-label="识别结果"
                >
                  {interimTranscript}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
