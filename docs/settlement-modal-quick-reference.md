# SettlementModal 快速参考卡片

## 📦 组件位置
```
src/components/TripLedgerCard/SettlementModal.tsx
```

## 🎯 核心功能
- ✅ 显示算账报告(已付/应付/净额)
- ✅ 颜色标识(红付绿收灰结清)
- ✅ 统计摘要(总已付/总应付/未结清人数)
- ✅ 清空数据功能(带二次确认)

## 📝 Props 类型
```tsx
type Props = {
  report: SettlementItem[];  // 算账报告数据
  onClose: () => void;        // 关闭模态框回调
  onClear?: () => void;       // 可选的清空数据回调
}
```

## 🚀 快速使用
```tsx
import { SettlementModal } from '@/components/TripLedgerCard/SettlementModal';
import { calculateSettlement } from '@/utils/tripCalculations';

// 生成算账报告
const settlementReport = calculateSettlement(transactions, travelers);

// 显示模态框
<SettlementModal
  report={settlementReport}
  onClose={() => setShowModal(false)}
  onClear={handleClearData}  // 可选
/>
```

## 🎨 颜色标识
- 🔴 **红色 (↑)**: 净额 > 0, 应该付钱
- 🟢 **绿色 (↓)**: 净额 < 0, 应该收钱
- ⚪ **灰色**: 净额 ≈ 0, 已结清

## 📊 算账逻辑
使用 `calculateSettlement(transactions, travelers)` 函数:
- **已付** = 累计作为付款人的金额
- **应付** = 根据分摊方式计算
- **净额** = 应付 - 已付

## 🧪 测试场景
查看 `SettlementModal.stories.tsx`:
- 场景1: 需要结算
- 场景2: 已结清
- 场景3: 混合情况
- 场景4: 复杂多人

## 📚 相关文档
- 集成指南: `docs/settlement-modal-integration.md`
- 验收报告: `docs/settlement-modal-acceptance.md`
- 使用示例: `SettlementModal.example.tsx`

## ✅ 验收标准
- ✅ 算账逻辑正确
- ✅ 颜色标识清晰
- ✅ 清空功能正常
- ✅ UI样式一致
- ✅ TypeScript编译通过

---

**Phase**: 6 - 算账报告
**状态**: ✅ 已完成
**日期**: 2026-02-05
