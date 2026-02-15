'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, SplitType } from '@/types/trip';
import { exchangeService } from '@/services/exchange';

// 预设的图标选项 (精简后保留 15 个)
const EMOJI_OPTIONS = [
  '🍜', '☕', '🍕', '🍔', '🍣', '🥐',
  '🚕', '🎫', '🛍️',
  '💊', '🎁', '🎮',
  '🏪', '⛽', '📍'
];

// 自定义图标类型定义
interface CustomIcon {
  id: string;
  data: string; // base64 data URL
  createdAt: string;
}

type Currency = 'KRW' | 'CNY';
type ButtonState = 'normal' | 'submitting' | 'success';

type Props = {
  travelers: string[];
  currentRate: number;
  onAdd: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'date'>) => void;
  onUpdate?: (id: string, updates: Partial<Transaction>) => void;
  onClose: () => void;
  editingTransaction?: Transaction | null;
};

export const AddTransactionModal = React.memo(({
  travelers,
  currentRate,
  onAdd,
  onUpdate,
  onClose,
  editingTransaction
}: Props) => {
  // 表单状态
  const [merchantName, setMerchantName] = useState(editingTransaction?.name || '');
  const [currency, setCurrency] = useState<Currency>('KRW');
  const [amountKRW, setAmountKRW] = useState(editingTransaction?.amountKRW.toString() || '');
  const [amountCNY, setAmountCNY] = useState(editingTransaction?.amountCNY.toString() || '');
  const [payer, setPayer] = useState(editingTransaction?.payer || '');
  const [splitType, setSplitType] = useState<SplitType>(editingTransaction?.splitType || 'even');
  const [splitAmong, setSplitAmong] = useState<string[]>(editingTransaction?.splitAmong || []);
  const [treatedBy, setTreatedBy] = useState(editingTransaction?.treatedBy || '');
  const [icon, setIcon] = useState(editingTransaction?.icon || '🍜'); 

  // 根据 editingTransaction 修正货币选择显示
  useEffect(() => {
    if (editingTransaction) {
      // 默认显示 KRW,如果有值则填充
      setMerchantName(editingTransaction.name);
      setAmountKRW(editingTransaction.amountKRW.toString());
      setAmountCNY(editingTransaction.amountCNY.toString());
      setPayer(editingTransaction.payer);
      setSplitType(editingTransaction.splitType);
      setSplitAmong(editingTransaction.splitAmong || []);
      setTreatedBy(editingTransaction.treatedBy || '');
      setIcon(editingTransaction.icon);
    }
  }, [editingTransaction]);

  // 自定义图标状态
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 按钮状态
  const [buttonState, setButtonState] = useState<ButtonState>('normal');

  // 验证错误
  const [errors, setErrors] = useState<{
    merchantName?: string;
    amount?: string;
    payer?: string;
    splitAmong?: string;
    treatedBy?: string;
  }>({});

  // 初始化汇率服务
  useEffect(() => {
    // 如果服务未初始化且提供了汇率,使用公共 API 设置汇率
    if (currentRate && !exchangeService.getCurrentRate()) {
      exchangeService.setRate(currentRate);
    }
  }, [currentRate]);

  // 初始化默认付款人
  useEffect(() => {
    if (travelers.length > 0 && !payer) {
      setPayer(travelers[0]);
    }
  }, [travelers, payer]);

  // 初始化默认参与分摊人员
  useEffect(() => {
    if (travelers.length > 0 && splitAmong.length === 0) {
      setSplitAmong(travelers);
    }
  }, [travelers]);

  // 初始化默认请客的人
  useEffect(() => {
    if (travelers.length > 0 && !treatedBy) {
      setTreatedBy(travelers[0]);
    }
  }, [travelers, treatedBy]);

  // 加载自定义图标
  useEffect(() => {
    const loadCustomIcons = (): CustomIcon[] => {
      try {
        const data = localStorage.getItem('customIcons');
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    };

    setCustomIcons(loadCustomIcons());
  }, []);

  // 处理金额变化 (支持双向转换)
  const handleAmountChange = (value: string, selectedCurrency: Currency) => {
    const amount = parseFloat(value);

    // 拒绝负数
    if (!isNaN(amount) && amount < 0) {
      setErrors(prev => ({ ...prev, amount: '金额不能为负数' }));
      // 清空对应的输入
      if (selectedCurrency === 'KRW') {
        setAmountKRW('');
        setAmountCNY('');
      } else {
        setAmountCNY('');
        setAmountKRW('');
      }
      return;
    }

    // 处理 0 或有效正数
    if (!isNaN(amount) && amount >= 0 && currentRate) {
      try {
        if (selectedCurrency === 'KRW') {
          // 输入的是韩元,计算人民币
          setAmountKRW(value);
          const cnyAmount = exchangeService.krwToCny(amount);
          setAmountCNY(cnyAmount.toFixed(2));
        } else {
          // 输入的是人民币,计算韩元
          setAmountCNY(value);
          const krwAmount = exchangeService.cnyToKrw(amount);
          setAmountKRW(Math.round(krwAmount).toString());
        }
        setErrors(prev => ({ ...prev, amount: undefined }));
      } catch (error) {
        console.error('货币转换失败:', error);
        setErrors(prev => ({ ...prev, amount: '汇率不可用' }));
      }
    } else {
      // 清空输入
      if (selectedCurrency === 'KRW') {
        setAmountKRW(value);
        setAmountCNY('');
      } else {
        setAmountCNY(value);
        setAmountKRW('');
      }
    }
  };

  // 切换参与分摊人员
  const toggleSplitAmong = (traveler: string) => {
    setSplitAmong(prev => {
      if (prev.includes(traveler)) {
        // 至少保留一个人
        if (prev.length > 1) {
          return prev.filter(t => t !== traveler);
        }
        return prev;
      } else {
        return [...prev, traveler];
      }
    });
    setErrors(prev => ({ ...prev, splitAmong: undefined }));
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // 验证商家名称
    if (!merchantName.trim()) {
      newErrors.merchantName = '请输入商家名称';
    }

    // 验证金额 (至少有一个币种有值)
    const krwAmount = parseFloat(amountKRW);
    const cnyAmount = parseFloat(amountCNY);
    const hasValidAmount =
      (amountKRW && !isNaN(krwAmount) && krwAmount > 0) ||
      (amountCNY && !isNaN(cnyAmount) && cnyAmount > 0);

    if (!hasValidAmount) {
      newErrors.amount = '请输入有效的金额';
    }

    // 验证付款人
    if (!payer) {
      newErrors.payer = '请选择付款人';
    }

    // 验证分摊逻辑
    if (splitType === 'even') {
      if (splitAmong.length === 0) {
        newErrors.splitAmong = '请至少选择1人参与分摊';
      }
    } else if (splitType === 'treat') {
      if (!treatedBy) {
        newErrors.treatedBy = '请选择请客的人';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 添加交易
  const handleAdd = async () => {
    // 1. 验证表单
    if (!validateForm()) {
      return;
    }

    // 2. 设置为 submitting,禁用按钮
    setButtonState('submitting');

    try {
      const krwAmount = parseFloat(amountKRW);
      const cnyAmount = parseFloat(amountCNY);

      const transactionData = {
        name: merchantName.trim(),
        amountKRW: krwAmount,
        amountCNY: cnyAmount,
        payer,
        splitType,
        icon,
        ...(splitType === 'even' && { splitAmong }),
        ...(splitType === 'treat' && { treatedBy }),
      };

      // 3. 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 300));

      // 4. 执行操作
      if (editingTransaction && onUpdate) {
        onUpdate(editingTransaction.id, transactionData);
      } else {
        onAdd(transactionData);
      }

      // 5. 设置为 success
      setButtonState('success');

      // 6. 1秒后恢复
      setTimeout(() => {
        setButtonState('normal');
        if (editingTransaction) onClose(); // 编辑完成后自动关闭
      }, 1000);

    } catch (error) {
      // 错误处理
      console.error('添加交易失败:', error);
      setButtonState('normal');
    }
  };

  // 处理背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理图片上传
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 处理图片
    await processAndSaveImage(file);

    // 重置 input 以允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 图片压缩与存储
  const processAndSaveImage = async (file: File): Promise<void> => {
    try {
      // 1. 读取文件
      const bitmap = await createImageBitmap(file);

      // 2. 调整尺寸 (最大 128x128)
      const maxSize = 128;
      let width = bitmap.width;
      let height = bitmap.height;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      // 3. 绘制到 canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0, width, height);

      // 4. 压缩为 JPEG (质量 0.7)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

      // 5. 检查大小 (最大 50KB)
      const sizeInKB = Math.round((dataUrl.length * 3) / 4 / 1024);
      if (sizeInKB > 50) {
        alert(`图片过大 (${sizeInKB}KB),请选择更小的图片 (最大 50KB)`);
        return;
      }

      // 6. 加载现有自定义图标
      const existing = loadCustomIcons();
      if (existing.length >= 5) {
        alert('最多只能添加 5 个自定义图标\n\n提示: 长按图标可以删除');
        return;
      }

      // 7. 保存新图标
      const newIcon: CustomIcon = {
        id: Date.now().toString(),
        data: dataUrl,
        createdAt: new Date().toISOString()
      };

      const updated = [...existing, newIcon];
      localStorage.setItem('customIcons', JSON.stringify(updated));

      // 8. 更新状态
      setCustomIcons(updated);
      setIcon(newIcon.id); // 选中新图标

    } catch (error) {
      console.error('图片处理失败:', error);
      alert('图片处理失败,请重试');
    }
  };

  // 加载自定义图标 (辅助函数)
  const loadCustomIcons = (): CustomIcon[] => {
    try {
      const data = localStorage.getItem('customIcons');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // 删除自定义图标
  const handleDeleteIcon = (iconId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('确定要删除这个自定义图标吗?')) {
      return;
    }

    try {
      const updated = customIcons.filter(icon => icon.id !== iconId);
      localStorage.setItem('customIcons', JSON.stringify(updated));
      setCustomIcons(updated);

      // 如果删除的是当前选中的图标,重置为默认
      if (icon === iconId) {
        setIcon('🍜');
      }
    } catch (error) {
      console.error('删除图标失败:', error);
      alert('删除图标失败,请重试');
    }
  };

  // 打勾动画组件
  const CheckAnimation = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 10
      }}
      className="flex items-center justify-center"
    >
      <svg width="24" height="24" viewBox="0 0 24 24">
        <motion.path
          d="M5 13l4 4L19 7"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      </svg>
    </motion.div>
  );

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
          className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#2D3436] mb-2">
              {editingTransaction ? '编辑交易记录' : '添加交易记录'}
            </h2>
            <p className="text-sm text-[#636E72]">
              {editingTransaction ? '修改您的消费信息' : '记录您的消费信息'}
            </p>
          </div>

          {/* 表单 */}
          <div className="space-y-6">
            {/* 图标选择 */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-3">
                选择图标
              </label>
              <div className="grid grid-cols-6 gap-3">
                {/* 预设图标 */}
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                      icon === emoji
                        ? 'bg-gradient-to-br from-[#FF6B81] to-[#FF9FF3] shadow-lg scale-110'
                        : 'bg-[#F0F2F6] hover:bg-[#E9EDF2]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}

                {/* 自定义图标 */}
                {customIcons.map((customIcon) => {
                  const isCustomIcon = icon === customIcon.id;
                  return (
                    <button
                      key={customIcon.id}
                      type="button"
                      onClick={() => setIcon(customIcon.id)}
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        isCustomIcon
                          ? 'bg-gradient-to-br from-[#FF6B81] to-[#FF9FF3] shadow-lg scale-110'
                          : 'bg-[#F0F2F6] hover:bg-[#E9EDF2]'
                      }`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleDeleteIcon(customIcon.id, e);
                      }}
                    >
                      <img
                        src={customIcon.data}
                        alt="自定义图标"
                        className="w-8 h-8 object-cover rounded"
                      />
                      {/* 删除提示 (可选) */}
                      <span className="absolute -top-1 -right-1 hidden group-hover:block w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                        ×
                      </span>
                    </button>
                  );
                })}

                {/* 添加自定义图标按钮 */}
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                         border-2 border-dashed border-[#636E72] bg-[#F0F2F6]
                         hover:bg-[#E9EDF2] hover:border-[#8B5CF6] transition-all"
                  title="添加自定义图标"
                >
                  <span className="text-[#636E72]">+</span>
                </button>

                {/* 隐藏的文件输入 */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              <p className="mt-2 text-xs text-[#636E72]">
                提示: 右键点击自定义图标可以删除
              </p>
            </div>

            {/* 商家名称 */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-2">
                商家名称 <span className="text-[#FF6B81]">*</span>
              </label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => {
                  setMerchantName(e.target.value);
                  setErrors(prev => ({ ...prev, merchantName: undefined }));
                }}
                placeholder="例如: 明洞饺子"
                className={`w-full px-5 py-4 rounded-[2.5rem] bg-white border border-white shadow-soft-out-sm transition-all ${
                  errors.merchantName
                    ? 'border-[#FF6B81] focus:border-[#FF6B81]'
                    : 'focus:border-[#8B5CF6]'
                } focus:outline-none text-sm`}
              />
              {errors.merchantName && (
                <p className="mt-2 text-xs text-[#FF6B81] font-medium">
                  {errors.merchantName}
                </p>
              )}
            </div>

            {/* 金额 */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-2">
                金额 <span className="text-[#FF6B81]">*</span>
              </label>

              {/* 币种选择 */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setCurrency('KRW')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    currency === 'KRW'
                      ? 'bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white shadow-lg'
                      : 'bg-[#F0F2F6] text-[#636E72] hover:bg-[#E9EDF2]'
                  }`}
                >
                  KRW (韩元)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('CNY')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    currency === 'CNY'
                      ? 'bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white shadow-lg'
                      : 'bg-[#F0F2F6] text-[#636E72] hover:bg-[#E9EDF2]'
                  }`}
                >
                  CNY (人民币)
                </button>
              </div>

              <div className="space-y-2">
                {/* 主输入框 */}
                <div className="relative">
                  <input
                    type="number"
                    value={currency === 'KRW' ? amountKRW : amountCNY}
                    onChange={(e) => handleAmountChange(e.target.value, currency)}
                    placeholder={currency === 'KRW' ? '例如: 15000' : '例如: 80'}
                    className={`w-full px-5 py-4 pl-12 pr-4 rounded-[2.5rem] bg-white border border-white shadow-soft-out-sm transition-all ${
                      errors.amount
                        ? 'border-[#FF6B81] focus:border-[#FF6B81]'
                        : 'focus:border-[#8B5CF6]'
                    } focus:outline-none text-sm`}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#636E72]">
                    {currency === 'KRW' ? '₩' : '¥'}
                  </span>
                </div>

                {/* 实时转换显示 */}
                {currency === 'KRW' && amountCNY && (
                  <div className="px-4 py-2 rounded-xl bg-[#E9EDF2] flex items-center justify-between">
                    <span className="text-sm text-[#636E72]">≈</span>
                    <span className="text-sm font-bold text-[#2D3436]">
                      ¥ {amountCNY} CNY
                    </span>
                  </div>
                )}
                {currency === 'CNY' && amountKRW && (
                  <div className="px-4 py-2 rounded-xl bg-[#E9EDF2] flex items-center justify-between">
                    <span className="text-sm text-[#636E72]">≈</span>
                    <span className="text-sm font-bold text-[#2D3436]">
                      ₩ {amountKRW} KRW
                    </span>
                  </div>
                )}
              </div>
              {errors.amount && (
                <p className="mt-2 text-xs text-[#FF6B81] font-medium">
                  {errors.amount}
                </p>
              )}
            </div>

            {/* 付款人 */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-2">
                付款人 <span className="text-[#FF6B81]">*</span>
              </label>
              <select
                value={payer}
                onChange={(e) => {
                  setPayer(e.target.value);
                  setErrors(prev => ({ ...prev, payer: undefined }));
                }}
                className={`w-full px-5 py-4 rounded-[2.5rem] bg-white border border-white shadow-soft-out-sm transition-all ${
                  errors.payer
                    ? 'border-[#FF6B81] focus:border-[#FF6B81]'
                    : 'focus:border-[#8B5CF6]'
                } focus:outline-none text-sm appearance-none cursor-pointer`}
              >
                <option value="">选择付款人</option>
                {travelers.map((traveler) => (
                  <option key={traveler} value={traveler}>
                    {traveler}
                  </option>
                ))}
              </select>
              {errors.payer && (
                <p className="mt-2 text-xs text-[#FF6B81] font-medium">
                  {errors.payer}
                </p>
              )}
            </div>

            {/* 分摊方式 */}
            <div>
              <label className="block text-sm font-bold text-[#2D3436] mb-3">
                分摊方式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['even', 'treat', 'none'] as SplitType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSplitType(type)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      splitType === type
                        ? 'bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white shadow-lg'
                        : 'bg-[#F0F2F6] text-[#636E72] hover:bg-[#E9EDF2]'
                    }`}
                  >
                    {type === 'even' && '平摊'}
                    {type === 'treat' && '请客'}
                    {type === 'none' && '不分摊'}
                  </button>
                ))}
              </div>
            </div>

            {/* 条件渲染: 参与分摊人员 */}
            {splitType === 'even' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-bold text-[#2D3436] mb-3">
                  参与分摊人员 <span className="text-[#FF6B81]">*</span>
                </label>
                <div className="space-y-2">
                  {travelers.map((traveler) => (
                    <label
                      key={traveler}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                        splitAmong.includes(traveler)
                          ? 'bg-gradient-to-r from-[#FF6B81]/20 to-[#FF9FF3]/20 border-2 border-[#FF6B81]'
                          : 'bg-[#F0F2F6] hover:bg-[#E9EDF2]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={splitAmong.includes(traveler)}
                        onChange={() => toggleSplitAmong(traveler)}
                        className="w-5 h-5 rounded border-2 border-[#636E72] text-[#FF6B81] focus:ring-[#FF6B81]"
                      />
                      <span className="text-sm font-bold text-[#2D3436]">
                        {traveler}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.splitAmong && (
                  <p className="mt-2 text-xs text-[#FF6B81] font-medium">
                    {errors.splitAmong}
                  </p>
                )}
              </motion.div>
            )}

            {/* 条件渲染: 请客的人 */}
            {splitType === 'treat' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-bold text-[#2D3436] mb-2">
                  请客的人 <span className="text-[#FF6B81]">*</span>
                </label>
                <select
                  value={treatedBy}
                  onChange={(e) => {
                    setTreatedBy(e.target.value);
                    setErrors(prev => ({ ...prev, treatedBy: undefined }));
                  }}
                  className={`w-full px-5 py-4 rounded-[2.5rem] bg-white border border-white shadow-soft-out-sm transition-all ${
                    errors.treatedBy
                      ? 'border-[#FF6B81] focus:border-[#FF6B81]'
                      : 'focus:border-[#8B5CF6]'
                  } focus:outline-none text-sm appearance-none cursor-pointer`}
                >
                  <option value="">选择请客的人</option>
                  {travelers.map((traveler) => (
                    <option key={traveler} value={traveler}>
                      {traveler}
                    </option>
                  ))}
                </select>
                {errors.treatedBy && (
                  <p className="mt-2 text-xs text-[#FF6B81] font-medium">
                    {errors.treatedBy}
                  </p>
                )}
              </motion.div>
            )}

            {/* 条件渲染: 不分摊提示 */}
            {splitType === 'none' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-3 rounded-xl bg-[#E9EDF2] text-sm text-[#636E72] text-center"
              >
                付款人 {payer} 将独自承担这笔费用
              </motion.div>
            )}
          </div>

          {/* 按钮 */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={buttonState !== 'normal'}
              className={`flex-1 px-6 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                buttonState === 'normal'
                  ? 'bg-[#F0F2F6] text-[#636E72] hover:bg-[#E9EDF2] active:scale-95'
                  : 'bg-[#F0F2F6] text-[#636E72] cursor-not-allowed'
              }`}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={buttonState !== 'normal'}
              className={`flex-1 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all ${
                buttonState === 'normal'
                  ? 'bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white hover:shadow-xl active:scale-95'
                  : buttonState === 'submitting'
                  ? 'bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white opacity-70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-400 to-green-500 text-white'
              }`}
            >
              {buttonState === 'normal' && (editingTransaction ? '保存修改' : '添加记录')}
              {buttonState === 'submitting' && (editingTransaction ? '保存中...' : '添加中...')}
              {buttonState === 'success' && <CheckAnimation />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

AddTransactionModal.displayName = 'AddTransactionModal';
