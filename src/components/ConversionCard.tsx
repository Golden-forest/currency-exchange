'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Currency } from '@/types';
import { NumberAnimation } from './NumberAnimation';

interface ConversionCardProps {
  amount: number;
  currency: Currency;
  label?: string;
  onAmountChange?: (newAmount: number) => void;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export function ConversionCard({
  amount,
  currency,
  label,
  onAmountChange,
  isEditing = false,
  onEditStart,
  onEditEnd
}: ConversionCardProps) {
  const [inputValue, setInputValue] = useState(amount.toString());
  const currencyLabel = currency === 'KRW' ? '韩币 (KRW)' : '人民币 (CNY)';

  const handleClick = () => {
    if (onEditStart) {
      setInputValue(amount.toString());
      onEditStart();
    }
  };

  const handleSubmit = () => {
    const newAmount = parseFloat(inputValue);
    if (!isNaN(newAmount) && newAmount >= 0 && onAmountChange) {
      onAmountChange(newAmount);
    }
    if (onEditEnd) {
      onEditEnd();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(amount.toString());
      if (onEditEnd) onEditEnd();
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="text-text-secondary font-extrabold ml-5 text-[10px] text-left opacity-70 uppercase tracking-widest">
        {label || currencyLabel}
      </div>

      <motion.div
        onClick={handleClick}
        whileHover={{ scale: isEditing ? 1 : 1.01 }}
        whileTap={{ scale: isEditing ? 1 : 0.99 }}
        className={`
          relative bg-white border-none rounded-4xl p-4 sm:p-5
          flex items-center justify-between
          shadow-soft-in
          transition-all cursor-text min-h-[85px] sm:min-h-[100px]
          ${isEditing ? 'ring-2 ring-primary/10' : ''}
        `}
      >
        <div className="flex-1 text-center mr-3">
          {isEditing ? (
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full text-4xl sm:text-5xl font-black text-[#1E293B] bg-transparent text-center outline-none"
              style={{ direction: 'ltr' }}
            />
          ) : (
            <div className="text-4xl sm:text-5xl font-black text-[#1E293B] tracking-tighter">
              <NumberAnimation value={amount} />
            </div>
          )}
        </div>

        {/* Currency Symbol Circle */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-soft-out-sm flex items-center justify-center shrink-0">
          <span className="text-lg sm:text-xl font-black text-[#1E293B]">
            {currency === 'KRW' ? '₩' : '¥'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
