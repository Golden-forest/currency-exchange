/**
 * OCR 图片识别服务
 *
 * 功能：
 * - 使用 Tesseract.js 从图片中提取文字
 * - 支持中韩语言识别
 * - 显示识别进度
 * - 完善的错误处理
 */

import Tesseract from 'tesseract.js';

// 支持的语言
const SUPPORTED_LANGUAGES = ['chi_sim', 'kor'];

// 图片大小限制（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 支持的图片格式
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];

/**
 * OCR 识别错误类型
 */
export class OCRError extends Error {
  constructor(
    message: string,
    public code: 'UNSUPPORTED_FORMAT' | 'FILE_TOO_LARGE' | 'RECOGNITION_FAILED' | 'NETWORK_ERROR' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'OCRError';
  }
}

/**
 * 验证图片文件
 *
 * @param file - 图片文件
 * @throws {OCRError} 如果文件不符合要求
 */
function validateImageFile(file: File): void {
  // 检查文件格式
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    throw new OCRError(
      `不支持的图片格式: ${file.type}。支持的格式: ${SUPPORTED_FORMATS.join(', ')}`,
      'UNSUPPORTED_FORMAT'
    );
  }

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new OCRError(
      `图片太大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大支持: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      'FILE_TOO_LARGE'
    );
  }
}

/**
 * 从图片中提取文字
 *
 * @param file - 图片文件
 * @param onProgress - 进度回调函数（0-100）
 * @returns Promise<string> - 识别出的文字
 * @throws {OCRError} 如果识别失败
 *
 * @example
 * ```typescript
 * try {
 *   const text = await extractText(file, (progress) => {
 *     console.log(`识别进度: ${progress}%`);
 *   });
 *   console.log('识别结果:', text);
 * } catch (error) {
 *   console.error('识别失败:', error.message);
 * }
 * ```
 */
export const extractText = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // 验证文件
  validateImageFile(file);

  try {
    // 创建 Tesseract worker
    const worker = await Tesseract.createWorker(SUPPORTED_LANGUAGES, 1, {
      logger: (message) => {
        // 解析进度信息
        if (message.status === 'recognizing text' && onProgress) {
          // message.progress 是 0-1 之间的小数
          const progress = Math.round(message.progress * 100);
          onProgress(progress);
        }
      },
    });

    // 识别图片
    const { data: { text } } = await worker.recognize(file);

    // 终止 worker
    await worker.terminate();

    // 检查识别结果
    if (!text || text.trim().length === 0) {
      throw new OCRError('未能识别出文字，请确保图片清晰', 'RECOGNITION_FAILED');
    }

    return text.trim();
  } catch (error) {
    // 如果是我们自定义的错误，直接抛出
    if (error instanceof OCRError) {
      throw error;
    }

    // 处理网络错误（通常是下载语言包失败）
    if (error instanceof Error && error.message.includes('Network error')) {
      throw new OCRError(
        '网络错误，无法下载语言包。请检查网络连接后重试',
        'NETWORK_ERROR'
      );
    }

    // 其他未知错误
    console.error('OCR 识别失败:', error);
    throw new OCRError(
      error instanceof Error ? error.message : '图片识别失败，请重试',
      'UNKNOWN'
    );
  }
};

/**
 * 获取友好的错误提示
 *
 * @param error - 错误对象
 * @returns 友好的错误提示文本
 */
export const getOCRErrorMessage = (error: unknown): string => {
  if (error instanceof OCRError) {
    switch (error.code) {
      case 'UNSUPPORTED_FORMAT':
        return '图片格式不支持';
      case 'FILE_TOO_LARGE':
        return '图片太大，请选择小于 10MB 的图片';
      case 'RECOGNITION_FAILED':
        return '未能识别出文字，请确保图片清晰';
      case 'NETWORK_ERROR':
        return '网络错误，请检查网络连接';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '图片识别失败，请重试';
};
