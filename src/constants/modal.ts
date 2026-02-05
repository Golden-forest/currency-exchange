/**
 * Modal 组件相关常量
 */

/**
 * QuickPhrasesModal 常量
 */
export const LONG_PRESS_DURATION = 500; // 长按触发时间（毫秒）

/**
 * HistoryModal 常量
 */
export const CLEAR_CONFIRM_DURATION = 3000; // 清空确认自动取消时间（毫秒）
export const MAX_HISTORY_ITEMS = 20; // 最大显示历史记录数

/**
 * 时间格式化常量（毫秒）
 */
export const TIME_UNITS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Toast 常量
 */
export const TOAST_DURATION = 2000; // Toast 显示时间（毫秒）
