# 旅行账本功能实现计划

## 项目概述

为第二个卡片 TripLedgerCard 添加完整的多人旅行分账功能，实现消费记录、分摊管理和最终算账功能。

**核心功能：**
- 旅行者管理和头像展示
- 消费记录添加（支持分摊/请客模式）
- 自动汇率转换（KRW ↔ CNY）
- 预算跟踪和进度显示
- 简化算账报告（每人净额）

## 数据结构设计

### TypeScript 类型定义

```typescript
// 旅行设置
type TripSettings = {
  travelers: string[];        // 旅行者姓名数组
  totalBudget: number;        // 总预算(KRW)
  currentRate: number;        // 汇率(1 CNY = ? KRW)
  location: string;           // 旅行地点
}

// 分摊类型
type SplitType = 'even' | 'treat' | 'none';

// 交易记录
type Transaction = {
  id: string;                 // 唯一ID
  name: string;               // 商家名称
  amountKRW: number;          // 韩元金额
  amountCNY: number;          // 人民币金额(自动转换)
  payer: string;              // 付款人
  splitType: SplitType;       // 分摊类型
  splitAmong?: string[];      // 参与分摊的人员(如果是even)
  treatedBy?: string;         // 请客的人(如果是treat)
  timestamp: number;          // 时间戳
  icon: string;               // 图标emoji
  date: string;               // 日期字符串(用于分组显示)
}

// 算账报告项
type SettlementItem = {
  traveler: string;           // 旅行者姓名
  totalPaid: number;          // 总共付了多少钱(CNY)
  totalShare: number;         // 应该承担的费用(CNY)
  balance: number;            // 净额(应付-已付,正数该付,负数该收)
  color: string;              // 头像背景色
}
```

## 组件架构

### 1. 主组件改造 - TripLedgerCard.tsx

**职责：** 组合子组件，管理全局状态

**状态管理：**
```typescript
const [settings, setSettings] = useLocalStorage<TripSettings>('tripSettings', null);
const [transactions, setTransactions] = useLocalStorage<Transaction[]>('tripTransactions', []);
const [showSettings, setShowSettings] = useState(false);
const [showAddTransaction, setShowAddTransaction] = useState(false);
const [showSettlement, setShowSettlement] = useState(false);
```

**核心计算逻辑：**
```typescript
// 计算总支出
const totalSpent = transactions.reduce((sum, t) => sum + t.amountKRW, 0);

// 计算预算使用百分比
const budgetPercentage = (totalSpent / settings.totalBudget) * 100;

// 计算剩余预算
const remainingBudget = settings.totalBudget - totalSpent;

// 生成分组交易(按日期)
const groupedTransactions = useMemo(() => {
  // 按日期分组逻辑
}, [transactions]);

// 生成算账报告
const settlementReport = useMemo(() => {
  // 计算每人的净额
}, [transactions, settings.travelers]);
```

### 2. 子组件 - TravelerAvatars.tsx

**位置：** `src/components/TripLedgerCard/TravelerAvatars.tsx`

**功能：** 显示旅行者头像

**Props：**
```typescript
type Props = {
  travelers: string[];
}
```

**实现要点：**
- 取每个旅行者姓名的最后一个字
- 4种预设背景色循环使用：`['#FF6B81', '#4ECDC4', '#FFE66D', '#95E1D3']`
- 横向滚动容器（超过4人时）
- 每个头像：40px圆形圆圈，白色文字，居中

**示例代码结构：**
```tsx
const COLORS = ['#FF6B81', '#4ECDC4', '#FFE66D', '#95E1D3'];

export function TravelerAvatars({ travelers }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {travelers.slice(-4).map((traveler, index) => {
        const lastChar = traveler.slice(-1);
        const color = COLORS[index % COLORS.length];
        return (
          <div
            key={traveler}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {lastChar}
          </div>
        );
      })}
    </div>
  );
}
```

### 3. 子组件 - SettingsModal.tsx

**位置：** `src/components/TripLedgerCard/SettingsModal.tsx`

**功能：** 设置旅行信息

**Props：**
```typescript
type Props = {
  settings: TripSettings | null;
  onSave: (settings: TripSettings) => void;
  onClose: () => void;
}
```

**表单字段：**
- 旅行者姓名（逗号分隔输入框）
- 总预算（KRW输入框）
- 旅行地点（文本输入框）
- 汇率（从第一个卡片自动获取，只读显示）

**验证逻辑：**
- 旅行者至少2人
- 总预算必须大于0
- 姓名不能为空

### 4. 子组件 - AddTransactionModal.tsx

**位置：** `src/components/TripLedgerCard/AddTransactionModal.tsx`

**功能：** 添加消费记录

**Props：**
```typescript
type Props = {
  travelers: string[];
  currentRate: number;
  onAdd: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'date'>) => void;
  onClose: () => void;
}
```

**表单字段：**
1. 商家名称（文本输入）
2. 金额（KRW输入，自动显示CNY转换）
3. 付款人（下拉选择）
4. 分摊方式（单选：平摊/请客/不分摊）
5. 参与分摊人员（多选checkbox，仅当选择"平摊"时显示）
6. 请客的人（下拉选择，仅当选择"请客"时显示）
7. 图标（emoji选择器）

**实时计算：**
```typescript
// 输入KRW时，实时转换CNY
const handleKRWChange = (amountKRW: number) => {
  const amountCNY = exchangeService.krwToCny(amountKRW);
  setAmountKRW(amountKRW);
  setAmountCNY(amountCNY);
};
```

### 5. 子组件 - SettlementModal.tsx

**位置：** `src/components/TripLedgerCard/SettlementModal.tsx`

**功能：** 显示算账报告

**Props：**
```typescript
type Props = {
  report: SettlementItem[];
  onClose: () => void;
}
```

**UI布局：**
- 标题："算账报告"
- 表格：旅行者 | 已付金额 | 应付金额 | 净额
- 颜色标识：净额>0显示红色(该付钱)，净额<0显示绿色(该收钱)
- 底部按钮："清空数据" / "关闭"

## 实现步骤

### Phase 1: 数据结构和工具函数（预计2-3小时）

**任务清单：**
1. 创建 `src/types/trip.ts` - 定义所有TypeScript类型
2. 创建 `src/utils/tripCalculations.ts` - 实现核心计算逻辑
   - `calculateSettlement()` - 计算每人净额
   - `groupTransactionsByDate()` - 按日期分组
   - `calculateTotalSpent()` - 计算总支出
3. 创建 `src/utils/idGenerator.ts` - 生成唯一ID

**验收标准：**
- 所有类型定义完整，无TypeScript错误
- 单元测试通过（如果使用Jest/Vitest）

### Phase 2: 旅行者头像组件（预计1小时）

**任务清单：**
1. 创建 `src/components/TripLedgerCard/TravelerAvatars.tsx`
2. 实现4种颜色循环逻辑
3. 实现横向滚动容器
4. 在 TripLedgerCard 中集成该组件

**位置：** 放在 Total Spent 卡片下方，交易列表上方

**验收标准：**
- 显示最后4个旅行者的最后一个字
- 颜色正确循环
- 超过4人时可滚动

### Phase 3: 设置模态框（预计2小时）

**任务清单：**
1. 创建 `src/components/TripLedgerCard/SettingsModal.tsx`
2. 实现表单验证
3. 从第一个卡片获取汇率（复用 `exchangeService`）
4. 保存到 localStorage

**集成点：**
- 点击右上角设置按钮打开
- 首次使用自动弹出（如果settings为null）

**验收标准：**
- 表单验证正确
- 数据成功保存到localStorage
- 页面刷新后数据保持

### Phase 4: 添加交易模态框（预计3小时）

**任务清单：**
1. 创建 `src/components/TripLedgerCard/AddTransactionModal.tsx`
2. 实现KRW到CNY的实时转换
3. 实现分摊方式的条件渲染
4. 添加emoji图标选择器
5. 生成唯一ID和时间戳

**集成点：**
- 点击右下角+按钮打开
- 添加成功后刷新交易列表

**验收标准：**
- 实时汇率转换准确
- 分摊逻辑正确
- 表单验证通过

### Phase 5: 交易列表更新（预计2小时）

**任务清单：**
1. 修改 TripLedgerCard.tsx 的交易列表部分
2. 从硬编码数据改为从 state 读取
3. 实现按日期分组显示
4. 实现删除功能（可选）

**UI优化：**
- 保持现有的卡片设计
- 显示真实的交易数据
- 动态计算每日小计

**验收标准：**
- 交易列表实时更新
- 日期分组正确
- 样式与现有设计一致

### Phase 6: 算账报告（预计2小时）

**任务清单：**
1. 创建 `src/components/TripLedgerCard/SettlementModal.tsx`
2. 实现算账逻辑：
   - 遍历所有交易
   - 累计每人的已付金额
   - 计算每人的应付金额（根据分摊方式）
   - 计算净额 = 应付 - 已付
3. 实现颜色标识逻辑
4. 添加清空数据功能

**算账逻辑示例：**
```typescript
function calculateSettlement(
  transactions: Transaction[],
  travelers: string[]
): SettlementItem[] {
  const report = travelers.map(traveler => ({
    traveler,
    totalPaid: 0,
    totalShare: 0,
    balance: 0,
    color: COLORS[travelers.indexOf(traveler) % COLORS.length]
  }));

  transactions.forEach(t => {
    // 累加已付金额
    const payerIndex = travelers.indexOf(t.payer);
    report[payerIndex].totalPaid += t.amountCNY;

    // 计算分摊金额
    if (t.splitType === 'even' && t.splitAmong) {
      const sharePerPerson = t.amountCNY / t.splitAmong.length;
      t.splitAmong.forEach(person => {
        const index = travelers.indexOf(person);
        report[index].totalShare += sharePerPerson;
      });
    } else if (t.splitType === 'treat' && t.treatedBy) {
      // 请客模式下，请客的人承担全部费用
      const treaterIndex = travelers.indexOf(t.treatedBy);
      report[treaterIndex].totalShare += t.amountCNY;
    } else if (t.splitType === 'none') {
      // 不分摊，付款人自己承担
      report[payerIndex].totalShare += t.amountCNY;
    }
  });

  // 计算净额
  report.forEach(item => {
    item.balance = item.totalShare - item.totalPaid;
  });

  return report;
}
```

**验收标准：**
- 算账逻辑正确
- 颜色标识清晰
- 清空功能正常

### Phase 7: 集成和测试（预计2小时）

**任务清单：**
1. 在 TripLedgerCard 中集成所有子组件
2. 测试完整用户流程：
   - 首次设置 → 添加交易 → 查看列表 → 算账报告
3. 测试边界情况：
   - 没有交易数据
   - 只有一笔交易
   - 大量交易数据
4. 性能优化（useMemo缓存计算）

**验收标准：**
- 完整流程无bug
- UI响应流畅
- localStorage数据正确

## 技术栈和依赖

**现有依赖（无需安装）：**
- `framer-motion` - 动画效果
- `react` - UI框架
- `useLocalStorage` hook - 数据持久化

**需要复用的服务：**
- `exchangeService` - 汇率转换服务（从第一个卡片）

**样式：**
- Tailwind CSS - 已配置
- Neumorphism 设计风格 - 保持一致

## 数据存储方案

**localStorage键名：**
```typescript
'tripSettings'      // TripSettings | null
'tripTransactions'  // Transaction[]
```

**数据迁移（可选）：**
- 预留版本号字段，便于未来数据结构升级

## 测试策略

**单元测试（可选）：**
- `calculateSettlement()` 函数测试各种分摊场景
- 汇率转换准确性测试

**集成测试（手动）：**
- 完整用户流程测试
- 边界情况测试

**UI测试：**
- 响应式布局测试
- 不同屏幕尺寸测试

## 性能优化

**使用useMemo缓存：**
- `groupedTransactions` - 交易分组
- `settlementReport` - 算账报告
- `totalSpent`, `budgetPercentage` - 统计数据

**列表优化：**
- 交易列表使用虚拟滚动（如果数据量大）
- 头像组件使用React.memo避免重渲染

## 未来扩展方向

**Phase 8（可选功能）：**
1. 导出功能 - 导出为Excel/CSV
2. 数据统计 - 消费类别分析
3. 多旅行支持 - 创建多个旅行记录
4. 云端同步 - 后端集成
5. 旅行者头像筛选 - 点击头像查看该人的所有交易

## 预计时间

**总计：14-16小时**

**分阶段交付：**
- Phase 1-2: 数据结构和头像（3-4小时）✅ 可独立交付
- Phase 3-4: 设置和添加交易（5小时）✅ 核心功能完成
- Phase 5-6: 交易列表和算账（4小时）✅ 完整功能
- Phase 7: 集成测试（2小时）✅ 最终交付

## 风险和挑战

**技术风险：**
- localStorage存储限制（5MB） - 解决方案：定期清理旧数据
- 汇率服务依赖 - 解决方案：缓存汇率数据

**设计风险：**
- 分摊逻辑复杂度 - 解决方案：保持简单分摊模式
- UI空间有限 - 解决方案：使用模态框和折叠面板

**用户体验风险：**
- 首次使用门槛 - 解决方案：提供引导提示
- 数据丢失风险 - 解决方案：添加导出功能（Phase 8）

## 成功标准

✅ 旅行者可以自定义设置（姓名、预算、地点）
✅ 可以添加消费记录（自动汇率转换）
✅ 支持平摊/请客/不分摊三种模式
✅ 实时显示预算使用情况
✅ 旅行者头像正确显示（最后4人，4种颜色）
✅ 交易列表按日期分组显示
✅ 算账报告准确显示每人净额
✅ 数据持久化到localStorage
✅ UI响应流畅，无卡顿

---

**文档创建时间：** 2026-02-05
**最后更新：** 2026-02-05
**状态：** 待实施
