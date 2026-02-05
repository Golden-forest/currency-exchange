/**
 * SettlementModal 使用示例
 *
 * 这个文件展示了如何使用 SettlementModal 组件
 */

import React, { useState } from 'react';
import { SettlementModal } from './SettlementModal';
import type { SettlementItem } from '@/types/trip';

// 示例数据
const EXAMPLE_SETTLEMENT_REPORT: SettlementItem[] = [
  {
    traveler: '张三',
    totalPaid: 150.00,
    totalShare: 200.00,
    balance: 50.00,
    color: '#FF6B81',
  },
  {
    traveler: '李四',
    totalPaid: 300.00,
    totalShare: 200.00,
    balance: -100.00,
    color: '#4ECDC4',
  },
  {
    traveler: '王五',
    totalPaid: 150.00,
    totalShare: 150.00,
    balance: 0.00,
    color: '#FFE66D',
  },
];

/**
 * 示例1: 基本使用 - 只显示报告,没有清空功能
 */
export function SettlementModalExample1() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        查看算账报告
      </button>

      {showModal && (
        <SettlementModal
          report={EXAMPLE_SETTLEMENT_REPORT}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

/**
 * 示例2: 带清空功能 - 显示报告并提供清空数据选项
 */
export function SettlementModalExample2() {
  const [showModal, setShowModal] = useState(false);
  const [report, setReport] = useState<SettlementItem[]>(EXAMPLE_SETTLEMENT_REPORT);

  const handleClear = () => {
    // 清空所有数据
    setReport([]);
    console.log('数据已清空');
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        查看算账报告
      </button>

      {showModal && (
        <SettlementModal
          report={report}
          onClose={() => setShowModal(false)}
          onClear={handleClear}
        />
      )}
    </div>
  );
}

/**
 * 示例3: 在 TripLedgerCard 中集成
 */
export function SettlementModalExample3() {
  // 这些状态应该在 TripLedgerCard 中管理
  const [showSettlement, setShowSettlement] = useState(false);
  const [transactions, setTransactions] = useState([
    // ... 交易数据
  ]);
  const [settings, setSettings] = useState({
    travelers: ['张三', '李四', '王五'],
    // ... 其他设置
  });

  // 生成算账报告
  const settlementReport = EXAMPLE_SETTLEMENT_REPORT; // 使用 calculateSettlement() 函数

  // 清空数据
  const handleClearData = () => {
    // 清空交易记录
    setTransactions([]);

    // 清空设置
    setSettings(null as any);

    // 清空 localStorage
    localStorage.removeItem('tripTransactions');
    localStorage.removeItem('tripSettings');
  };

  return (
    <div>
      {/* 算账按钮 */}
      <button onClick={() => setShowSettlement(true)}>
        生成算账报告
      </button>

      {/* 算账模态框 */}
      {showSettlement && (
        <SettlementModal
          report={settlementReport}
          onClose={() => setShowSettlement(false)}
          onClear={handleClearData}
        />
      )}
    </div>
  );
}

/**
 * 使用 calculateSettlement() 函数生成报告
 */
import { calculateSettlement } from '@/utils/tripCalculations';

export function SettlementModalExample4() {
  const [showModal, setShowModal] = useState(false);

  // 模拟数据
  const transactions = [
    {
      id: '1',
      name: '明洞饺子',
      amountKRW: 15000,
      amountCNY: 79.50,
      payer: '张三',
      splitType: 'even' as const,
      splitAmong: ['张三', '李四', '王五'],
      timestamp: Date.now(),
      icon: '🍜',
      date: '2026-02-05',
    },
    {
      id: '2',
      name: '星巴克',
      amountKRW: 8000,
      amountCNY: 42.40,
      payer: '李四',
      splitType: 'treat' as const,
      treatedBy: '李四',
      timestamp: 1738768800000,
      icon: '☕',
      date: '2026-02-05',
    },
  ];

  const travelers = ['张三', '李四', '王五'];

  // 计算算账报告
  const settlementReport = calculateSettlement(transactions, travelers);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        查看算账报告
      </button>

      {showModal && (
        <SettlementModal
          report={settlementReport}
          onClose={() => setShowModal(false)}
          onClear={() => {
            console.log('清空数据');
          }}
        />
      )}
    </div>
  );
}

/**
 * 测试不同场景的算账报告
 */
export function SettlementModalTestScenarios() {
  const [activeScenario, setActiveScenario] = useState<keyof typeof scenarios>('even');

  const scenarios = {
    even: {
      name: '平均分摊场景',
      transactions: [
        {
          id: '1',
          name: '午餐',
          amountKRW: 30000,
          amountCNY: 159.00,
          payer: '张三',
          splitType: 'even' as const,
          splitAmong: ['张三', '李四', '王五'],
          timestamp: 1738768800000,
          icon: '🍜',
          date: '2026-02-05',
        },
      ],
      travelers: ['张三', '李四', '王五'],
    },
    treat: {
      name: '请客场景',
      transactions: [
        {
          id: '1',
          name: '晚餐',
          amountKRW: 50000,
          amountCNY: 265.00,
          payer: '李四',
          splitType: 'treat' as const,
          treatedBy: '李四',
          timestamp: 1738768800000,
          icon: '🍕',
          date: '2026-02-05',
        },
      ],
      travelers: ['张三', '李四', '王五'],
    },
    none: {
      name: '不分摊场景',
      transactions: [
        {
          id: '1',
          name: '个人购物',
          amountKRW: 10000,
          amountCNY: 53.00,
          payer: '王五',
          splitType: 'none' as const,
          timestamp: 1738768800000,
          icon: '🛍️',
          date: '2026-02-05',
        },
      ],
      travelers: ['张三', '李四', '王五'],
    },
  };

  const scenario = scenarios[activeScenario];
  const report = calculateSettlement(scenario.transactions, scenario.travelers);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {Object.keys(scenarios).map((key) => (
          <button
            key={key}
            onClick={() => setActiveScenario(key as keyof typeof scenarios)}
            className={`px-4 py-2 rounded-xl ${
              activeScenario === key
                ? 'bg-[#FF6B81] text-white'
                : 'bg-[#F0F2F6] text-[#636E72]'
            }`}
          >
            {scenarios[key as keyof typeof scenarios].name}
          </button>
        ))}
      </div>

      <SettlementModal
        report={report}
        onClose={() => {}}
        onClear={() => console.log('清空数据')}
      />
    </div>
  );
}
