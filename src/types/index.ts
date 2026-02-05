export type Currency = 'KRW' | 'CNY';

export interface ExchangeRate {
  rate: number;
  timestamp: number;
  date: string;
}

export interface ConversionResult {
  from: Currency;
  to: Currency;
  amount: number;
  result: number;
}

export interface QuickAmount {
  label: string;
  value: number;
  currency: Currency;
}

// 导出旅行账本相关类型
export type {
  TripSettings,
  SplitType,
  Transaction,
  SettlementItem,
  TransactionsByDate,
} from './trip';
