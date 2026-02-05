import { ExchangeRate } from '@/types';

interface ExchangeRateResponse {
  rates: {
    CNY: number;
  };
  date: string;
}

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/KRW';
const CACHE_DURATION = 60 * 60 * 1000; // 1小时

export class ExchangeRateService {
  private currentRate: number | null = null;
  private lastUpdate: Date | null = null;

  /**
   * 从 API 获取汇率
   */
  async fetchRate(): Promise<number> {
    try {
      const response = await fetch(EXCHANGE_API_URL);

      if (!response.ok) {
        throw new Error('API 请求失败');
      }

      const data = await response.json();

      // 添加空值检查
      if (!data.rates || !data.rates.CNY) {
        throw new Error('API 返回数据格式错误');
      }

      this.currentRate = data.rates.CNY;
      this.lastUpdate = new Date();

      // 缓存汇率
      this.cacheRate(data);

      // 此时 currentRate 保证不为 null
      return this.currentRate!;
    } catch (error) {
      console.error('获取汇率失败:', error);

      // 尝试使用缓存
      const cached = this.getCachedRate();
      if (cached) {
        this.currentRate = cached.rate;
        this.lastUpdate = new Date(cached.timestamp);
        // 此时 currentRate 保证不为 null
        return this.currentRate!;
      }

      throw error;
    }
  }

  /**
   * 缓存汇率到 localStorage
   */
  private cacheRate(data: ExchangeRateResponse): void {
    if (typeof window === 'undefined') return;

    const cacheData = {
      rate: data.rates.CNY,
      timestamp: Date.now(),
      date: data.date,
    };

    localStorage.setItem('exchangeRate', JSON.stringify(cacheData));
  }

  /**
   * 从 localStorage 获取缓存
   */
  private getCachedRate(): ExchangeRate | null {
    if (typeof window === 'undefined') return null;

    const cached = localStorage.getItem('exchangeRate');
    if (!cached) return null;

    const data = JSON.parse(cached) as ExchangeRate;
    const age = Date.now() - data.timestamp;

    // 如果缓存过期,返回 null
    if (age > CACHE_DURATION) {
      return null;
    }

    return data;
  }

  /**
   * 韩币转人民币
   */
  krwToCny(krw: number): number {
    if (!this.currentRate) {
      throw new Error('汇率未加载');
    }
    return krw * this.currentRate;
  }

  /**
   * 人民币转韩币
   */
  cnyToKrw(cny: number): number {
    if (!this.currentRate) {
      throw new Error('汇率未加载');
    }
    return cny / this.currentRate;
  }

  /**
   * 格式化数字
   */
  formatNumber(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
  }

  /**
   * 获取当前汇率
   */
  getCurrentRate(): number | null {
    return this.currentRate;
  }

  /**
   * 获取最后更新时间
   */
  getLastUpdate(): Date | null {
    return this.lastUpdate;
  }
}

// 导出单例
export const exchangeService = new ExchangeRateService();
