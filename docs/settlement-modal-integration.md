# SettlementModal 组件集成指南

## 组件概述

`SettlementModal` 是旅行账本功能的算账报告模态框组件,用于显示每个人在旅行中的支付情况和应付金额。

## 文件位置

```
src/components/TripLedgerCard/SettlementModal.tsx
```

## 功能特性

### 1. 算账报告显示
- 显示每个旅行者的已付金额、应付金额和净额
- 颜色标识:
  - **红色 (↑)**: 净额 > 0,该付钱
  - **绿色 (↓)**: 净额 < 0,该收钱
  - **灰色**: 净额 ≈ 0,已结清

### 2. 统计摘要
- 总已付金额
- 总应付金额
- 未结清人数

### 3. 清空数据功能
- 可选的清空数据按钮
- 二次确认对话框,防止误操作
- 清空所有交易记录和设置

## Props 类型定义

```typescript
type Props = {
  report: SettlementItem[];  // 算账报告数据
  onClose: () => void;        // 关闭模态框回调
  onClear?: () => void;       // 可选的清空数据回调
}
```

## 使用方法

### 基本使用

```tsx
import { useState } from 'react';
import { SettlementModal } from '@/components/TripLedgerCard/SettlementModal';
import { calculateSettlement } from '@/utils/tripCalculations';

function TripLedgerCard() {
  const [showSettlement, setShowSettlement] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<TripSettings | null>(null);

  // 生成算账报告
  const settlementReport = useMemo(() => {
    if (!settings || transactions.length === 0) return [];
    return calculateSettlement(transactions, settings.travelers);
  }, [transactions, settings]);

  return (
    <div>
      {/* 触发按钮 */}
      <button onClick={() => setShowSettlement(true)}>
        查看算账报告
      </button>

      {/* 算账模态框 */}
      {showSettlement && (
        <SettlementModal
          report={settlementReport}
          onClose={() => setShowSettlement(false)}
        />
      )}
    </div>
  );
}
```

### 带清空功能

```tsx
function TripLedgerCard() {
  const [showSettlement, setShowSettlement] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<TripSettings | null>(null);

  const settlementReport = useMemo(() => {
    if (!settings || transactions.length === 0) return [];
    return calculateSettlement(transactions, settings.travelers);
  }, [transactions, settings]);

  // 清空数据
  const handleClearData = () => {
    setTransactions([]);
    setSettings(null);

    // 清空 localStorage
    localStorage.removeItem('tripTransactions');
    localStorage.removeItem('tripSettings');
  };

  return (
    <div>
      <button onClick={() => setShowSettlement(true)}>
        查看算账报告
      </button>

      {showSettlement && (
        <SettlementModal
          report={settlementReport}
          onClose={() => setShowSettlement(false)}
          onClear={handleClearData}  // 添加清空回调
        />
      )}
    </div>
  );
}
```

## 算账逻辑说明

算账报告使用 `calculateSettlement()` 函数生成,该函数位于 `src/utils/tripCalculations.ts`。

### 算账规则

1. **已付金额 (totalPaid)**
   - 累计该人作为付款人的所有交易金额
   - 不考虑分摊方式

2. **应付金额 (totalShare)**
   - 根据分摊方式计算:
     - **even (平摊)**: 交易金额 / 参与人数
     - **treat (请客)**: 请客的人承担全部金额
     - **none (不分摊)**: 付款人自己承担

3. **净额 (balance)**
   - balance = totalShare - totalPaid
   - **> 0**: 应该付钱(应付 > 已付)
   - **< 0**: 应该收钱(应付 < 已付)
   - **≈ 0**: 已结清(应付 ≈ 已付)

### 示例场景

#### 场景1: 平均分摊
```
交易: 午餐 ¥159, 张三付款, 三人平摊
结果:
- 张三: 已付 ¥159, 应付 ¥53, 净额 -¥106 (应该收)
- 李四: 已付 ¥0, 应付 ¥53, 净额 ¥53 (应该付)
- 王五: 已付 ¥0, 应付 ¥53, 净额 ¥53 (应该付)
```

#### 场景2: 请客模式
```
交易: 晚餐 ¥265, 张三付款, 李四请客
结果:
- 张三: 已付 ¥265, 应付 ¥0, 净额 -¥265 (应该收)
- 李四: 已付 ¥0, 应付 ¥265, 净额 ¥265 (应该付)
- 王五: 已付 ¥0, 应付 ¥0, 净额 ¥0 (已结清)
```

#### 场景3: 不分摊
```
交易: 购物 ¥53, 王五付款, 不分摊
结果:
- 张三: 已付 ¥0, 应付 ¥0, 净额 ¥0 (已结清)
- 李四: 已付 ¥0, 应付 ¥0, 净额 ¥0 (已结清)
- 王五: 已付 ¥53, 应付 ¥53, 净额 ¥0 (已结清)
```

## UI 设计规范

### 颜色方案
- **主色调**: 与其他模态框保持一致
- **背景**: 白色 (#FFFFFF)
- **边框**: 圆角 3rem
- **阴影**: shadow-2xl

### 箭头标识
- **↑ (红色)**: 应该付钱
- **↓ (绿色)**: 应该收钱
- **无箭头**: 已结清

### 头像颜色
循环使用6种预设颜色:
```typescript
const COLORS = [
  '#FF6B81',  // 红色
  '#4ECDC4',  // 青色
  '#FFE66D',  // 黄色
  '#95E1D3',  // 绿色
  '#A8E6CF',  // 浅绿
  '#FFD93D',  // 橙色
];
```

## 注意事项

1. **浮点数精度**
   - 使用 `Math.abs(balance) < 0.01` 判断是否已结清
   - 金额显示保留两位小数

2. **空数据处理**
   - 如果没有交易数据,不显示模态框
   - 或者显示空状态提示

3. **清空确认**
   - 清空操作会删除所有数据
   - 必须经过二次确认
   - 清空后自动关闭模态框

4. **动画效果**
   - 使用 framer-motion 实现平滑动画
   - 背景模糊效果 (backdrop-blur-sm)
   - 模态框缩放动画

## 集成检查清单

- [ ] 导入 SettlementModal 组件
- [ ] 导入 calculateSettlement 函数
- [ ] 创建算账报告状态
- [ ] 实现显示/隐藏逻辑
- [ ] 添加清空数据回调(可选)
- [ ] 测试算账逻辑正确性
- [ ] 验证UI样式一致性
- [ ] 测试清空确认对话框

## 常见问题

### Q: 如何判断一个人是否已结清?
A: 使用 `Math.abs(balance) < 0.01` 判断,考虑浮点数精度。

### Q: 清空数据后如何恢复?
A: 清空操作不可逆,建议在确认对话框中明确提示用户。

### Q: 如何处理没有交易数据的情况?
A: 可以不显示算账按钮,或者显示提示信息"暂无交易记录"。

### Q: 算账报告的数据来源是什么?
A: 使用 `calculateSettlement(transactions, travelers)` 函数计算得出。

## 相关文件

- `src/types/trip.ts` - 类型定义
- `src/utils/tripCalculations.ts` - 算账逻辑
- `src/components/TripLedgerCard/SettingsModal.tsx` - 设置模态框
- `src/components/TripLedgerCard/AddTransactionModal.tsx` - 添加交易模态框
- `src/components/TripLedgerCard/TravelerAvatars.tsx` - 旅行者头像组件

---

**创建时间**: 2026-02-05
**状态**: ✅ 已完成
**阶段**: Phase 6 - 算账报告
