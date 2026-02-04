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

  const handleDoubleClick = () => {
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
    <motion.div
      onDoubleClick={handleDoubleClick}
      whileHover={{ scale: isEditing ? 1 : 1.02 }}
      whileTap={{ scale: isEditing ? 1 : 0.98 }}
      className="bg-bg-card border border-gold-border rounded-2xl p-8 text-center shadow-lg hover:shadow-gold transition-all cursor-pointer relative"
    >
      {isEditing ? (
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full text-6xl font-bold text-gold bg-transparent text-center outline-none"
          style={{ direction: 'rtl' }}
        />
      ) : (
        <div className="text-6xl font-bold text-gold mb-2">
          <NumberAnimation value={amount} />
        </div>
      )}
      <div className="text-text-secondary text-base">
        {label || currencyLabel}
      </div>
      {!isEditing && (
        <div className="absolute bottom-1 right-2">
          <span className="text-[10px] text-gray-500/40">
            双击编辑
          </span>
        </div>
      )}
    </motion.div>
  );
}
