/**
 * AddTransactionModal 使用示例
 *
 * 这个示例展示如何在父组件中使用 AddTransactionModal 组件
 */

'use client';

import React, { useState } from 'react';
import { AddTransactionModal } from './AddTransactionModal';
import { Transaction } from '@/types/trip';

export default function AddTransactionModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 示例:旅行者列表
  const travelers = ['张三', '李四', '王五'];

  // 示例:当前汇率 (1 CNY = 189 KRW, 所以汇率约为 0.0053)
  const currentRate = 0.0053;

  // 处理添加交易
  const handleAddTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp' | 'date'>) => {
    // 在父组件中生成唯一ID、时间戳和日期
    const newTransaction: Transaction = {
      ...transactionData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD 格式
    };

    console.log('新交易记录:', newTransaction);

    // 将交易添加到你的状态中
    // setTransactions(prev => [...prev, newTransaction]);

    // 关闭模态框
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* 触发模态框的按钮 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
      >
        添加交易记录
      </button>

      {/* 模态框 */}
      {isModalOpen && (
        <AddTransactionModal
          travelers={travelers}
          currentRate={currentRate}
          onAdd={handleAddTransaction}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * 使用说明:
 *
 * 1. Props 说明:
 *    - travelers: 旅行者姓名数组
 *    - currentRate: 当前汇率 (1 KRW = ? CNY)
 *    - onAdd: 添加交易的回调函数,接收不含 id/timestamp/date 的交易数据
 *    - onClose: 关闭模态框的回调函数
 *
 * 2. 父组件责任:
 *    - 生成唯一ID
 *    - 生成时间戳
 *    - 生成日期字符串
 *    - 管理交易列表状态
 *
 * 3. 交易数据结构:
 *    {
 *      name: string;           // 商家名称
 *      amountKRW: number;      // 韩元金额
 *      amountCNY: number;      // 人民币金额
 *      payer: string;          // 付款人
 *      splitType: SplitType;   // 分摊类型: 'even' | 'treat' | 'none'
 *      splitAmong?: string[];  // 参与分摊人员(如果是even)
 *      treatedBy?: string;     // 请客的人(如果是treat)
 *      icon: string;           // emoji图标
 *      id: string;             // 父组件生成
 *      timestamp: number;      // 父组件生成
 *      date: string;           // 父组件生成(YYYY-MM-DD)
 *    }
 *
 * 4. 分摊逻辑:
 *    - even: 所有选中的人平分费用
 *    - treat: 由某个人请客(其他人不承担)
 *    - none: 付款人自己承担(不分摊)
 *
 * 5. 实时汇率转换:
 *    - 输入KRW金额时自动转换CNY
 *    - 使用 exchangeService.krwToCny() 方法
 */
