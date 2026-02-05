/**
 * SettlementModal 可视化测试
 *
 * 这个文件可以用来查看组件的实际渲染效果
 * 将这个组件导入到页面中查看不同的场景
 */

import React, { useState } from 'react';
import { SettlementModal } from './SettlementModal';
import type { SettlementItem } from '@/types/trip';

/**
 * 测试页面组件
 * 用于查看 SettlementModal 在不同场景下的显示效果
 */
export function SettlementModalVisualTest() {
  const [activeScenario, setActiveScenario] = useState<string>('scenario1');
  const [showModal, setShowModal] = useState(false);

  // 测试场景
  const scenarios: Record<string, { name: string; report: SettlementItem[] }> = {
    scenario1: {
      name: '场景1: 需要结算',
      report: [
        {
          traveler: '张三',
          totalPaid: 159.00,
          totalShare: 53.00,
          balance: -106.00,
          color: '#FF6B81',
        },
        {
          traveler: '李四',
          totalPaid: 0,
          totalShare: 53.00,
          balance: 53.00,
          color: '#4ECDC4',
        },
        {
          traveler: '王五',
          totalPaid: 0,
          totalShare: 53.00,
          balance: 53.00,
          color: '#FFE66D',
        },
      ],
    },
    scenario2: {
      name: '场景2: 已结清',
      report: [
        {
          traveler: '张三',
          totalPaid: 159.00,
          totalShare: 159.00,
          balance: 0,
          color: '#FF6B81',
        },
        {
          traveler: '李四',
          totalPaid: 159.00,
          totalShare: 159.00,
          balance: 0,
          color: '#4ECDC4',
        },
        {
          traveler: '王五',
          totalPaid: 159.00,
          totalShare: 159.00,
          balance: 0,
          color: '#FFE66D',
        },
      ],
    },
    scenario3: {
      name: '场景3: 混合情况',
      report: [
        {
          traveler: '张三',
          totalPaid: 500.00,
          totalShare: 300.00,
          balance: -200.00,
          color: '#FF6B81',
        },
        {
          traveler: '李四',
          totalPaid: 100.00,
          totalShare: 300.00,
          balance: 200.00,
          color: '#4ECDC4',
        },
        {
          traveler: '王五',
          totalPaid: 300.00,
          totalShare: 300.00,
          balance: 0,
          color: '#FFE66D',
        },
      ],
    },
    scenario4: {
      name: '场景4: 复杂多人',
      report: [
        {
          traveler: '小明',
          totalPaid: 0,
          totalShare: 100.00,
          balance: 100.00,
          color: '#FF6B81',
        },
        {
          traveler: '小红',
          totalPaid: 300.00,
          totalShare: 100.00,
          balance: -200.00,
          color: '#4ECDC4',
        },
        {
          traveler: '小刚',
          totalPaid: 50.00,
          totalShare: 100.00,
          balance: 50.00,
          color: '#FFE66D',
        },
        {
          traveler: '小李',
          totalPaid: 150.00,
          totalShare: 100.00,
          balance: -50.00,
          color: '#95E1D3',
        },
      ],
    },
  };

  const currentScenario = scenarios[activeScenario];

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2D3436] mb-8">
          SettlementModal 可视化测试
        </h1>

        {/* 场景选择器 */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">
            选择测试场景
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => setActiveScenario(key)}
                className={`px-6 py-4 rounded-xl font-bold text-left transition-all ${
                  activeScenario === key
                    ? 'bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white shadow-lg'
                    : 'bg-[#F0F2F6] text-[#636E72] hover:bg-[#E9EDF2]'
                }`}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>

        {/* 场景详情 */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">
            场景详情
          </h2>
          <div className="space-y-2">
            {currentScenario.report.map((item) => (
              <div
                key={item.traveler}
                className="flex items-center justify-between p-4 bg-[#F0F2F6] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.traveler.slice(-1)}
                  </div>
                  <span className="font-bold text-[#2D3436]">
                    {item.traveler}
                  </span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-[#636E72]">已付: </span>
                    <span className="font-bold text-[#2D3436]">
                      ¥{item.totalPaid.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#636E72]">应付: </span>
                    <span className="font-bold text-[#2D3436]">
                      ¥{item.totalShare.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#636E72]">净额: </span>
                    <span
                      className={`font-bold ${
                        Math.abs(item.balance) < 0.01
                          ? 'text-[#636E72]'
                          : item.balance > 0
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {Math.abs(item.balance) < 0.01
                        ? '已结清'
                        : `¥${Math.abs(item.balance).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 打开模态框按钮 */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            打开算账报告模态框
          </button>
        </div>

        {/* 模态框 */}
        {showModal && (
          <SettlementModal
            report={currentScenario.report}
            onClose={() => setShowModal(false)}
            onClear={() => {
              console.log('清空数据');
              alert('数据已清空!');
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * 使用说明:
 *
 * 1. 将这个组件导入到任何页面中查看效果
 * 2. 点击不同的场景按钮切换测试数据
 * 3. 点击"打开算账报告模态框"查看实际效果
 * 4. 测试清空功能,确认对话框是否正常显示
 *
 * 示例:
 * import { SettlementModalVisualTest } from '@/components/TripLedgerCard/SettlementModal.stories';
 *
 * export default function TestPage() {
 *   return <SettlementModalVisualTest />;
 * }
 */
