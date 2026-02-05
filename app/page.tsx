'use client';

import { useState, useEffect } from 'react';
import { exchangeService } from '@/services/exchange';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CurrencyConverterCard } from '@/components/CurrencyConverterCard';
import { TripLedgerCard } from '@/components/TripLedgerCard';
import { TranslationCard } from '@/components/TranslationCard';
import { motion, AnimatePresence } from 'framer-motion';

type CardType = 'converter' | 'ledger' | 'translation';
const CARDS: CardType[] = ['converter', 'ledger', 'translation'];

export default function Home() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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
    const nextIndex = activeCardIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < CARDS.length) {
      setDirection(newDirection);
      setActiveCardIndex(nextIndex);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      y: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
    }),
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
    <main className={`h-screen w-full ${getBackgroundGradient()} overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 relative touch-none transition-all duration-500`}>

      <div className="w-full max-w-lg h-[92vh] relative perspective-1000">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeCardIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 }
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.y;
              if (swipe < -100) {
                paginate(1);
              } else if (swipe > 100) {
                paginate(-1);
              }
            }}
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
              />
            )}
            {activeCardIndex === 1 && <TripLedgerCard />}
            {activeCardIndex === 2 && <TranslationCard />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
        {CARDS.map((_, i) => (
          <div
            key={i}
            onClick={() => {
              setDirection(i > activeCardIndex ? 1 : -1);
              setActiveCardIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${activeCardIndex === i ? 'bg-[#8B5CF6] h-6 shadow-glow-primary' : 'bg-[#D1D9E6]'
              }`}
          />
        ))}
      </div>

    </main>
  );
}

