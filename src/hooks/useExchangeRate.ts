'use client';

import { useState, useEffect } from 'react';
import { exchangeService } from '@/services/exchange';

export function useExchangeRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentRate = await exchangeService.fetchRate();
      setRate(currentRate);
      setLastUpdate(exchangeService.getLastUpdate());
    } catch (err) {
      setError('无法获取汇率数据');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  return {
    rate,
    lastUpdate,
    isLoading,
    error,
    refetch: fetchRate,
  };
}
