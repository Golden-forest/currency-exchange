'use client';

import { useState, useEffect } from 'react';
import { exchangeService } from '@/services/exchange';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CurrencyConverterCard } from '@/components/CurrencyConverterCard';
import { TripLedgerCard } from '@/components/TripLedgerCard';
import { TranslationCard } from '@/components/TranslationCard';
import { motion } from 'framer-motion';
import { validateDeepSeekConfig } from '@/utils/deepseekTranslate';

type CardType = 'converter' | 'ledger' | 'translation';
const CARDS: CardType[] = ['converter', 'ledger', 'translation'];

export default function Home() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // 账本联动状态
  const [ledgerInitialRate, setLedgerInitialRate] = useState<number | undefined>(undefined);
  const [ledgerAutoOpen, setLedgerAutoOpen] = useState(false);

  // 边界状态检测
  const isAtFirstCard = activeCardIndex === 0;
  const isAtLastCard = activeCardIndex === CARDS.length - 1;

  // 在应用启动时验证环境变量配置
  useEffect(() => {
    const configValidation = validateDeepSeekConfig();
    if (!configValidation.isValid) {
      console.warn('配置警告:', configValidation.error);
      // 在开发环境中显示更详细的警告
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '\n请按以下步骤配置 DeepSeek API:\n' +
          '1. 复制 .env.local.example 为 .env.local\n' +
          '2. 在 .env.local 中设置 NEXT_PUBLIC_DEEPSEEK_API_KEY\n' +
          '3. 重启开发服务器\n\n' +
          '获取 API 密钥: https://platform.deepseek.com/'
        );
      }
    }
  }, []);

  // Currency states
  const [cnyAmount, setCnyAmount] = useLocalStorage<number>('cnyAmount', 0);
  const [krwAmount, setKrwAmount] = useLocalStorage<number>('krwAmount', 0);
  const [lastEdited, setLastEdited] = useLocalStorage<'cny' | 'krw'>('lastEdited', 'krw');

  useEffect(() => {
    if (!exchangeService.getCurrentRate()) return;

    try {
      if (lastEdited === 'cny') {
        const krw = exchangeService.cnyToKrw(cnyAmount);
        setKrwAmount(krw);
      } else {
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

  const handleClear = () => {
    setCnyAmount(0);
    setKrwAmount(0);
  };

  // 处理从汇率卡片添加到账本
  const handleAddToLedger = (rate: number) => {
    // 设置初始汇率和自动打开标志
    setLedgerInitialRate(rate);
    setLedgerAutoOpen(true);

    // 切换到账本卡片
    setActiveCardIndex(1);
  };

  const paginate = (newDirection: number) => {
    const nextIndex = activeCardIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < CARDS.length) {
      setActiveCardIndex(nextIndex);
    }
  };

  // 根据当前卡片获取对应的背景色
  const getBackgroundGradient = () => {
    switch (activeCardIndex) {
      case 0: // CurrencyConverterCard - 紫色
        return 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]';
      case 1: // TripLedgerCard - 粉红色
        return 'bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E1]';
      case 2: // TranslationCard - 淡青色
        return 'bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD]';
      default:
        return 'bg-[#EAEEF3]';
    }
  };

  return (
    <main className={`h-screen w-full ${getBackgroundGradient()} overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 relative touch-optimized`}>

      <div className="w-full max-w-lg h-[92vh] relative">
        {/* 使用 layoutId 实现平滑过渡，无需 AnimatePresence */}
        <motion.div
          layoutId="card-container"
          className="absolute inset-0 w-full h-full"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        >
          {activeCardIndex === 0 && (
            <motion.div
              drag="x"
              dragConstraints={
                isAtFirstCard || isAtLastCard
                  ? { left: -50, right: 50 }
                  : { left: 0, right: 0 }
              }
              dragElastic={0.1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeConfidenceThreshold = 50;
                const swipe = offset.x;

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <CurrencyConverterCard
                cnyAmount={cnyAmount}
                krwAmount={krwAmount}
                onCnyChange={handleCnyChange}
                onKrwChange={handleKrwChange}
                onQuickSelect={handleQuickSelect}
                onClear={handleClear}
                lastEdited={lastEdited}
                setLastEdited={setLastEdited}
                onAddToLedger={handleAddToLedger}
              />
            </motion.div>
          )}
          {activeCardIndex === 1 && (
            <motion.div
              drag="x"
              dragConstraints={
                isAtFirstCard || isAtLastCard
                  ? { left: -50, right: 50 }
                  : { left: 0, right: 0 }
              }
              dragElastic={0.1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeConfidenceThreshold = 50;
                const swipe = offset.x;

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <TripLedgerCard
                initialRate={ledgerInitialRate}
                autoOpenAddModal={ledgerAutoOpen}
                onModalOpenStateChanged={(isOpen) => {
                  if (!isOpen) {
                    setLedgerAutoOpen(false);
                    setLedgerInitialRate(undefined);
                  }
                }}
              />
            </motion.div>
          )}
          {activeCardIndex === 2 && (
            <motion.div
              drag="x"
              dragConstraints={
                isAtFirstCard || isAtLastCard
                  ? { left: -50, right: 50 }
                  : { left: 0, right: 0 }
              }
              dragElastic={0.1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeConfidenceThreshold = 50;
                const swipe = offset.x;

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <TranslationCard />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-30 opacity-40">
        {CARDS.map((_, i) => (
          <div
            key={i}
            onClick={() => setActiveCardIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeCardIndex === i
                ? 'bg-[#8B5CF6] w-6 shadow-glow-primary'
                : 'bg-[#D1D9E6]'
            }`}
          />
        ))}
      </div>

    </main>
  );
}

