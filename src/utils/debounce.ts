/**
 * Debounce 工具函数
 *
 * 防抖：在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时
 */

/**
 * Debounce 函数
 *
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('搜索:', query);
 * }, 500);
 *
 * debouncedSearch('hello');
 * debouncedSearch('hello world'); // 只有这个会执行
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  // 使用 ReturnType<typeof setTimeout> 代替 NodeJS.Timeout
  // 这样可以同时兼容浏览器和 Node.js 环境
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    // 清除之前的定时器
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Debounce 异步函数
 *
 * @param asyncFunc 要防抖的异步函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的异步函数
 *
 * @example
 * ```ts
 * const debouncedFetch = debounceAsync(async (url: string) => {
 *   const data = await fetch(url);
 *   return data.json();
 * }, 500);
 *
 * debouncedFetch('/api/search');
 * ```
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFunc: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  // 使用 ReturnType<typeof setTimeout> 代替 NodeJS.Timeout
  // 这样可以同时兼容浏览器和 Node.js 环境
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    // 清除之前的定时器
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // 创建新的 Promise
    const promise = new Promise<ReturnType<T>>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncFunc.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          timeoutId = null;
          pendingPromise = null;
        }
      }, delay);
    });

    pendingPromise = promise;
    return promise;
  };
}

/**
 * 取消退防抖
 *
 * @param debouncedFunc 防抖函数
 */
export function cancelDebounce(debouncedFunc: (...args: any[]) => void): void {
  // 这个函数需要与 debounce 配合使用
  // 在实际使用中，可以通过闭包来保存 timeoutId 并提供取消功能
  // 这里只是一个示例，实际实现可能需要根据具体需求调整
}
