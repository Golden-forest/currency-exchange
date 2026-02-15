'use client';

import { useState, useEffect } from 'react';
import { exchangeService } from '@/services/exchange';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CurrencyConverterCard } from '@/components/CurrencyConverterCard';
import { TripLedgerCard } from '@/components/TripLedgerCard';
import { TranslationCard } from '@/components/TranslationCard';
import { motion, AnimatePresence } from 'framer-motion';
import { validateDeepSeekConfig } from '@/utils/deepseekTranslate';

type CardType = 'converter' | 'ledger' | 'translation';
const CARDS: CardType[] = ['converter', 'ledger', 'translation'];

export default function Home() {
  // 使用 [page, direction] 记录当前页和滑动方向
  const [[page, direction], setPage] = useState([0, 0]);

  // 账本联动状态
  const [ledgerInitialRate, setLedgerInitialRate] = useState<number | undefined>(undefined);
  const [ledgerAutoOpen, setLedgerAutoOpen] = useState(false);

  const activeCardIndex = page;

  // 在应用启动时验证环境变量配置
  useEffect(() => {
    const configValidation = validateDeepSeekConfig();
    if (!configValidation.isValid) {
      console.warn('配置警告:', configValidation.error);
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

  const paginate = (newDirection: number) => {
    const nextIndex = page + newDirection;
    if (nextIndex >= 0 && nextIndex < CARDS.length) {
      setPage([nextIndex, newDirection]);
    }
  };

  const handleAddToLedger = (rate: number) => {
    setLedgerInitialRate(rate);
    setLedgerAutoOpen(true);
    setPage([1, 1]); // 切换到账本卡片，方向为正
  };

  // 动画变体：模拟纸张层叠
  const variants = {
    enter: (direction: number) => ({
      scale: 0.9,
      opacity: 0,
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
    },
    exit: (direction: number) => ({
      // 向左滑出或向右滑出
      x: direction > 0 ? -500 : 500,
      scale: 0.9,
      opacity: 0,
    })
  };

  const getBackgroundGradient = () => {
    switch (activeCardIndex) {
      case 0: return 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]';
      case 1: return 'bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E1]';
      case 2: return 'bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD]';
      default: return 'bg-[#EAEEF3]';
    }
  };

  return (
    <main className={`h-screen w-full ${getBackgroundGradient()} transition-colors duration-700 overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 relative touch-none`}>

      <div className="w-full max-w-lg h-[88vh] relative flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 500, damping: 50 },
              scale: { type: "spring", stiffness: 500, damping: 50 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              const swipeThreshold = 50;
              if (swipe < -swipeThreshold && activeCardIndex < CARDS.length - 1) {
                paginate(1);
              } else if (swipe > swipeThreshold && activeCardIndex > 0) {
                paginate(-1);
              }
            }}
            whileTap={{ scale: 0.98 }}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          >
            {activeCardIndex === 0 && (
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
            )}
            {activeCardIndex === 1 && (
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
            )}
            {activeCardIndex === 2 && (
              <TranslationCard />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {CARDS.map((_, i) => (
          <div
            key={i}
            onClick={() => {
              const dir = i > activeCardIndex ? 1 : -1;
              setPage([i, dir]);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeCardIndex === i
                ? 'bg-[#8B5CF6] w-6 shadow-glow-primary'
                : 'bg-[#D1D9E6] opacity-50'
            }`}
          />
        ))}
      </div>

    </main>
  );
}