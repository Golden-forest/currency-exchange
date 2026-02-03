'use client';

import { useState, useEffect } from 'react';
import { exchangeService } from '@/services/exchange';
import { useCurrencyStorage } from '@/hooks/useLocalStorage';
import { Currency } from '@/types';
import { ExchangeRateCard } from '@/components/ExchangeRateCard';
import { ConversionCard } from '@/components/ConversionCard';
import { CurrencySelector } from '@/components/CurrencySelector';
import { QuickButtons } from '@/components/QuickButtons';

export default function Home() {
  const { currency, setCurrency, amount, setAmount } = useCurrencyStorage();
  const [result, setResult] = useState<number>(0);

  // 计算转换结果
  useEffect(() => {
    if (!exchangeService.getCurrentRate()) return;

    try {
      let converted = 0;
      if (currency === 'KRW') {
        converted = exchangeService.krwToCny(amount);
      } else {
        converted = exchangeService.cnyToKrw(amount);
      }
      setResult(converted);
    } catch (error) {
      console.error('转换失败:', error);
    }
  }, [amount, currency]);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    // 交换金额
    setAmount(result);
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value);
  };

  const inputCurrency: Currency = currency;
  const resultCurrency: Currency = currency === 'KRW' ? 'CNY' : 'KRW';

  return (
    <main className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-5 animate-fade-in-up">
        {/* 汇率信息 */}
        <ExchangeRateCard />

        {/* 转换区域 */}
        <div className="flex flex-col gap-4">
          <ConversionCard amount={amount} currency={inputCurrency} />
          <ConversionCard amount={result} currency={resultCurrency} />
        </div>

        {/* 货币选择 */}
        <CurrencySelector selected={currency} onSelect={handleCurrencyChange} />

        {/* 快捷按钮 */}
        <QuickButtons currency={currency} onSelectAmount={handleAmountSelect} />
      </div>
    </main>
  );
}
