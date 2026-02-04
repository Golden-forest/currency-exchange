'use client';

import { useState, useEffect } from 'react';
import { exchangeService } from '@/services/exchange';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ExchangeRateCard } from '@/components/ExchangeRateCard';
import { ConversionCard } from '@/components/ConversionCard';
import { QuickButtons } from '@/components/QuickButtons';

type EditingCard = 'cny' | 'krw' | null;

export default function Home() {
  // 固定:CNY在上,KRW在下
  const [cnyAmount, setCnyAmount] = useLocalStorage<number>('cnyAmount', 0);
  const [krwAmount, setKrwAmount] = useLocalStorage<number>('krwAmount', 0);
  const [editingCard, setEditingCard] = useState<EditingCard>(null);
  const [lastEdited, setLastEdited] = useState<'cny' | 'krw'>('cny');

  // 根据最后编辑的货币计算另一个
  useEffect(() => {
    if (!exchangeService.getCurrentRate()) return;

    try {
      if (lastEdited === 'cny') {
        // 从CNY计算KRW
        const krw = exchangeService.cnyToKrw(cnyAmount);
        setKrwAmount(krw);
      } else {
        // 从KRW计算CNY
        const cny = exchangeService.krwToCny(krwAmount);
        setCnyAmount(cny);
      }
    } catch (error) {
      console.error('转换失败:', error);
    }
  }, [cnyAmount, krwAmount, lastEdited]);

  const handleCnyChange = (newAmount: number) => {
    setCnyAmount(newAmount);
    setLastEdited('cny');
  };

  const handleKrwChange = (newAmount: number) => {
    setKrwAmount(newAmount);
    setLastEdited('krw');
  };

  const handleQuickSelect = (amount: number) => {
    if (lastEdited === 'cny') {
      setCnyAmount(amount);
    } else {
      setKrwAmount(amount);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-5 animate-fade-in-up flex-1">
        {/* 转换区域 - CNY固定在上,KRW固定在下 */}
        <div className="flex flex-col gap-4 flex-1">
          <ConversionCard
            amount={cnyAmount}
            currency="CNY"
            onAmountChange={handleCnyChange}
            isEditing={editingCard === 'cny'}
            onEditStart={() => setEditingCard('cny')}
            onEditEnd={() => setEditingCard(null)}
          />
          <ConversionCard
            amount={krwAmount}
            currency="KRW"
            onAmountChange={handleKrwChange}
            isEditing={editingCard === 'krw'}
            onEditStart={() => setEditingCard('krw')}
            onEditEnd={() => setEditingCard(null)}
          />
        </div>

        {/* 快捷按钮 */}
        <QuickButtons
          currency={lastEdited === 'cny' ? 'CNY' : 'KRW'}
          onSelectAmount={handleQuickSelect}
        />
      </div>

      {/* 汇率信息 - 移到最底部 */}
      <div className="mt-4">
        <ExchangeRateCard />
      </div>
    </main>
  );
}
