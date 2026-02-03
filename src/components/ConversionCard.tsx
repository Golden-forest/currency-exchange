'use client';

import { motion } from 'framer-motion';
import { Currency } from '@/types';
import { NumberAnimation } from './NumberAnimation';

interface ConversionCardProps {
  amount: number;
  currency: Currency;
  label?: string;
  onClick?: () => void;
}

export function ConversionCard({ amount, currency, label, onClick }: ConversionCardProps) {
  const currencyLabel = currency === 'KRW' ? '韩币 (KRW)' : '人民币 (CNY)';

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-bg-card border border-gold-border rounded-2xl p-8 text-center shadow-lg hover:shadow-gold transition-all cursor-pointer"
    >
      <div className="text-6xl font-bold text-gold mb-2">
        <NumberAnimation value={amount} />
      </div>
      <div className="text-text-secondary text-base">
        {label || currencyLabel}
      </div>
    </motion.div>
  );
}
