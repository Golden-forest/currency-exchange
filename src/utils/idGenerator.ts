/**
 * 唯一ID生成器
 */

/**
 * 生成唯一的交易ID
 * 格式: txn_时间戳_随机数
 * @returns 唯一的交易ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `txn_${timestamp}_${random}`;
}

/**
 * 生成唯一的旅行者ID
 * 格式: traveler_时间戳_随机数
 * @returns 唯一的旅行者ID
 */
export function generateTravelerId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `traveler_${timestamp}_${random}`;
}

/**
 * 生成唯一ID的通用函数
 * @param prefix ID前缀
 * @returns 唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}
