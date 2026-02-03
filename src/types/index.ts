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
