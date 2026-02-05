/**
 * SettingsModal 组件使用示例
 *
 * 这个示例展示如何在 TripLedgerCard 中集成 SettingsModal 组件
 */

'use client';

import { useState } from 'react';
import { SettingsModal } from '@/components/TripLedgerCard/SettingsModal';
import { TripSettings } from '@/types/trip';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function TripLedgerCardExample() {
  // 使用 localStorage 持久化设置
  const [settings, setSettings] = useLocalStorage<TripSettings | null>('tripSettings', null);
  const [showSettings, setShowSettings] = useState(false);

  // 首次使用时自动弹出设置对话框
  useState(() => {
    if (!settings) {
      setShowSettings(true);
    }
  });

  const handleSaveSettings = (newSettings: TripSettings) => {
    setSettings(newSettings);
    // 可以在这里添加其他逻辑，比如刷新数据
  };

  return (
    <div>
      {/* 主卡片内容 */}
      <div>
        <h2>Trip Ledger</h2>
        {/* 显示设置按钮 */}
        <button onClick={() => setShowSettings(true)}>
          ⚙️ 设置
        </button>

        {/* 显示当前设置信息 */}
        {settings && (
          <div>
            <p>地点: {settings.location}</p>
            <p>旅行者: {settings.travelers.join(', ')}</p>
            <p>预算: ₩{settings.totalBudget.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* 设置模态框 */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

/**
 * 集成要点：
 *
 * 1. 状态管理：
 *    - 使用 useLocalStorage hook 持久化设置
 *    - 首次使用时自动弹出设置对话框（settings === null）
 *
 * 2. 事件处理：
 *    - onSave: 保存新设置并更新 localStorage
 *    - onClose: 关闭模态框
 *
 * 3. UI 集成：
 *    - 在右上角添加设置按钮
 *    - 点击按钮时 setShowSettings(true)
 *
 * 4. 数据流：
 *    settings -> SettingsModal 显示当前设置
 *    onSave -> 更新 settings -> 保存到 localStorage
 */
