/**
 * 时间格式化工具函数
 */

import { TIME_UNITS } from '@/constants/modal';

/**
 * 格式化时间戳为相对时间或具体时间
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // 小于 1 分钟
  if (diff < TIME_UNITS.MINUTE) {
    return '刚刚';
  }

  // 小于 1 小时
  if (diff < TIME_UNITS.HOUR) {
    const minutes = Math.floor(diff / TIME_UNITS.MINUTE);
    return `${minutes} 分钟前`;
  }

  // 小于 1 天
  if (diff < TIME_UNITS.DAY) {
    const hours = Math.floor(diff / TIME_UNITS.HOUR);
    return `${hours} 小时前`;
  }

  // 小于 7 天
  if (diff < TIME_UNITS.WEEK) {
    const days = Math.floor(diff / TIME_UNITS.DAY);
    return `${days} 天前`;
  }

  // 超过 7 天，显示具体日期
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${month}月${day}日 ${hour}:${minute}`;
}
