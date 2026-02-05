'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TripSettings } from '@/types/trip';
import { exchangeService } from '@/services/exchange';

type Props = {
  settings: TripSettings | null;
  onSave: (settings: TripSettings) => void;
  onClose: () => void;
};

export const SettingsModal = React.memo(({ settings, onSave, onClose }: Props) => {
  // 表单状态
  const [travelersStr, setTravelersStr] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [location, setLocation] = useState('');
  const [currentRate, setCurrentRate] = useState<number | null>(null);

  // 验证错误
  const [errors, setErrors] = useState<{
    travelers?: string;
    budget?: string;
    location?: string;
  }>({});

  // 初始化表单数据
  useEffect(() => {
    if (settings) {
      setTravelersStr(settings.travelers.join(', '));
      setTotalBudget(settings.totalBudget.toString());
      setLocation(settings.location);
      setCurrentRate(settings.currentRate);
    } else {
      // 尝试从 exchangeService 获取汇率
      const rate = exchangeService.getCurrentRate();
      setCurrentRate(rate);
    }
  }, [settings]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // 解析旅行者姓名
    const travelers = travelersStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // 验证旅行者
    if (travelers.length === 0) {
      newErrors.travelers = '请至少输入1个旅行者姓名';
    } else if (travelers.length < 2) {
      newErrors.travelers = '旅行者至少需要2人';
    } else if (travelers.some(name => name.length === 0)) {
      newErrors.travelers = '姓名不能为空';
    }

    // 验证预算
    const budget = parseFloat(totalBudget);
    if (!totalBudget || isNaN(budget)) {
      newErrors.budget = '请输入总预算';
    } else if (budget <= 0) {
      newErrors.budget = '预算必须大于0';
    }

    // 验证地点
    if (!location.trim()) {
      newErrors.location = '请输入旅行地点';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存设置
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const travelers = travelersStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const budget = parseFloat(totalBudget);

    // 如果没有汇率，使用默认值
    const rate = currentRate || 0.0053; // 1 CNY ≈ 189 KRW

    const newSettings: TripSettings = {
      travelers,
      totalBudget: budget,
      currentRate: rate,
      location: location.trim(),
    };

    onSave(newSettings);
    onClose();
  };

  // 处理背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-2xl"
        >
          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#2D3436] mb-2">
              旅行设置
            </h2>
            <p className="text-sm text-[#636E72]">
              配置您的旅行信息和预算
            </p>
          </div>

          {/* 表单 */}
          <div className="space-y-6">
            {/* 旅行者姓名 */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-2">
                旅行者姓名 <span className="text-[#FF6B81]">*</span>
              </label>
              <input
                type="text"
                value={travelersStr}
                onChange={(e) => {
                  setTravelersStr(e.target.value);
                  setErrors(prev => ({ ...prev, travelers: undefined }));
                }}
                placeholder="用逗号分隔，例如: 张三, 李四, 王五"
                className={`w-full px-4 py-3 rounded-2xl bg-[#F0F2F6] border-2 transition-all ${
                  errors.travelers
                    ? 'border-[#FF6B81] focus:border-[#FF6B81]'
                    : 'border-transparent focus:border-[#8B5CF6]'
                } focus:outline-none shadow-soft-in text-sm`}
              />
              {errors.travelers && (
                <p className="mt-2 text-xs text-[#FF6B81] font-medium">
                  {errors.travelers}
                </p>
              )}
              {!errors.travelers && travelersStr && (
                <p className="mt-2 text-xs text-[#636E72]">
                  已添加 {travelersStr.split(',').filter(s => s.trim()).length} 位旅行者
                </p>
              )}
            </div>

            {/* 总预算 */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-2">
                总预算 (KRW) <span className="text-[#FF6B81]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => {
                    setTotalBudget(e.target.value);
                    setErrors(prev => ({ ...prev, budget: undefined }));
                  }}
                  placeholder="例如: 2000000"
                  className={`w-full px-4 py-3 pl-12 pr-4 rounded-2xl bg-[#F0F2F6] border-2 transition-all ${
                    errors.budget
                      ? 'border-[#FF6B81] focus:border-[#FF6B81]'
                      : 'border-transparent focus:border-[#8B5CF6]'
                  } focus:outline-none shadow-soft-in text-sm`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#636E72]">
                  ₩
                </span>
              </div>
              {errors.budget && (
                <p className="mt-2 text-xs text-[#FF6B81] font-medium">
                  {errors.budget}
                </p>
              )}
              {!errors.budget && totalBudget && !isNaN(parseFloat(totalBudget)) && (
                <p className="mt-2 text-xs text-[#636E72]">
                  约 ¥ {(parseFloat(totalBudget) * (currentRate || 0.0053)).toFixed(2)} CNY
                </p>
              )}
            </div>

            {/* 旅行地点 */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-2">
                旅行地点 <span className="text-[#FF6B81]">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setErrors(prev => ({ ...prev, location: undefined }));
                }}
                placeholder="例如: Seoul, South Korea"
                className={`w-full px-4 py-3 rounded-2xl bg-[#F0F2F6] border-2 transition-all ${
                  errors.location
                    ? 'border-[#FF6B81] focus:border-[#FF6B81]'
                    : 'border-transparent focus:border-[#8B5CF6]'
                } focus:outline-none shadow-soft-in text-sm`}
              />
              {errors.location && (
                <p className="mt-2 text-xs text-[#FF6B81] font-medium">
                  {errors.location}
                </p>
              )}
            </div>

            {/* 汇率（只读） */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-2">
                当前汇率
              </label>
              <div className="px-4 py-3 rounded-2xl bg-[#E9EDF2] text-sm text-[#636E72]">
                {currentRate ? (
                  <span>
                    1 CNY = <span className="font-bold text-[#2D3436]">{(1 / currentRate).toFixed(2)}</span> KRW
                  </span>
                ) : (
                  <span className="text-[#FF6B81]">汇率加载中...</span>
                )}
              </div>
              <p className="mt-2 text-xs text-[#A4B0BE]">
                汇率自动从汇率转换器获取
              </p>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl bg-[#F0F2F6] text-[#636E72] font-bold text-sm hover:bg-[#E9EDF2] active:scale-95 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              保存设置
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

SettingsModal.displayName = 'SettingsModal';
