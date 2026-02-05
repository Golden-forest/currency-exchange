# AddTransactionModal 组件文档

## 概述

`AddTransactionModal` 是旅行账本功能的添加交易记录模态框组件,用于记录和添加旅行中的消费交易。

## 功能特性

### 1. 表单字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 图标选择 | emoji | - | 24个预设图标,涵盖餐饮、交通、住宿、购物等场景 |
| 商家名称 | 文本 | ✓ | 消费场所的名称,如"明洞饺子" |
| 金额(KRW) | 数字 | ✓ | 韩元金额,输入时自动转换CNY |
| 付款人 | 下拉选择 | ✓ | 从旅行者列表中选择 |
| 分摊方式 | 单选 | ✓ | 平摊/请客/不分摊三种模式 |
| 参与分摊人员 | 多选 | 条件必填 | 仅当选择"平摊"时显示 |
| 请客的人 | 下拉选择 | 条件必填 | 仅当选择"请客"时显示 |

### 2. 实时汇率转换

```typescript
// 使用 exchangeService 进行实时转换
const handleKRWChange = (value: string) => {
  setAmountKRW(value);
  const krwAmount = parseFloat(value);
  if (!isNaN(krwAmount) && krwAmount > 0 && currentRate) {
    const cnyAmount = exchangeService.krwToCny(krwAmount);
    setAmountCNY(cnyAmount.toFixed(2));
  }
};
```

**特点:**
- 输入KRW金额后自动计算并显示CNY金额
- 显示格式: `¥ 150.00 CNY`
- 使用全局 `exchangeService` 单例

### 3. 分摊逻辑

#### 3.1 平摊 (even)
- 多个参与者平均分摊费用
- 每人承担 = 总金额 / 参与人数
- 需要选择至少1人参与分摊

**示例:**
```
总金额: ₩15,000 (¥79.50)
参与分摊: [张三, 李四, 王五]
每人承担: ¥26.50
```

#### 3.2 请客 (treat)
- 由一个人请客,其他人不承担费用
- 请客的人承担全部金额

**示例:**
```
总金额: ₩15,000 (¥79.50)
请客的人: 张三
张三承担: ¥79.50
其他人承担: ¥0
```

#### 3.3 不分摊 (none)
- 付款人自己承担全部费用
- 相当于个人消费

**示例:**
```
总金额: ₩15,000 (¥79.50)
付款人: 张三
张三承担: ¥79.50
```

### 4. 条件渲染

组件根据选择的分摊方式动态显示相应字段:

```typescript
{splitType === 'even' && (
  <motion.div>
    {/* 参与分摊人员复选框 */}
  </motion.div>
)}

{splitType === 'treat' && (
  <motion.div>
    {/* 请客的人下拉选择 */}
  </motion.div>
)}

{splitType === 'none' && (
  <motion.div>
    {/* 不分摊提示信息 */}
  </motion.div>
)}
```

使用 `framer-motion` 实现平滑的展开/收起动画。

### 5. Emoji 选择器

提供24个预设图标,分为6类:

- 🍜 ☕ 🍕 🍔 🍣 🥐 (餐饮)
- 🚕 🚇 ✈️ 🏨 🎫 🛍️ (交通住宿)
- 💊 🎁 🎮 🎬 📸 🎵 (娱乐其他)
- 💰 🏧 🏪 ⛽ 🚩 📍 (通用)

**交互:**
- 8列网格布局
- 选中状态: 渐变背景 + 阴影 + 放大效果
- 默认选中: 💰 (金钱图标)

### 6. 表单验证

#### 验证规则

| 字段 | 验证规则 |
|------|----------|
| 商家名称 | 不能为空 |
| 金额 | 必须大于0的数字 |
| 付款人 | 必须选择 |
| 参与分摊人员 | 至少选择1人(仅平摊模式) |
| 请客的人 | 必须选择(仅请客模式) |

#### 错误提示

```typescript
// 错误状态管理
const [errors, setErrors] = useState<{
  merchantName?: string;
  amount?: string;
  payer?: string;
  splitAmong?: string;
  treatedBy?: string;
}>({});
```

- 错误时显示红色边框
- 下方显示错误提示文本
- 输入时自动清除对应字段的错误

### 7. UI设计风格

#### Neumorphism 风格

```css
/* 柔和的阴影效果 */
.shadow-soft-in {
  box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.05),
              inset -2px -2px 4px rgba(255, 255, 255, 0.8);
}
```

#### 配色方案

| 用途 | 颜色 | 用途 |
|------|------|------|
| 主背景 | #FFFFFF | 模态框背景 |
| 次要背景 | #F0F2F6 | 输入框、未选中按钮 |
| 悬停背景 | #E9EDF2 | 输入框悬停 |
| 主文本 | #2D3436 | 标题、重要文本 |
| 次要文本 | #636E72 | 描述、次要信息 |
| 错误色 | #FF6B81 | 错误提示、错误边框 |
| 主色 | #8B5CF6 | 聚焦边框 |
| 渐变主色 | #FF6B81 → #FF9FF3 | 主要按钮、选中状态 |

## Props 类型定义

```typescript
type Props = {
  travelers: string[];    // 旅行者姓名数组
  currentRate: number;    // 当前汇率 (1 KRW = ? CNY)
  onAdd: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'date'>) => void;
  onClose: () => void;    // 关闭模态框回调
};
```

## 返回数据格式

```typescript
// onAdd 回调接收的数据结构
{
  name: string;           // 商家名称
  amountKRW: number;      // 韩元金额
  amountCNY: number;      // 人民币金额
  payer: string;          // 付款人
  splitType: SplitType;   // 分摊类型
  icon: string;           // emoji图标
  splitAmong?: string[];  // 参与分摊人员(仅even)
  treatedBy?: string;     // 请客的人(仅treat)
}
```

**注意:** `id`, `timestamp`, `date` 由父组件负责生成。

## 状态管理

### 表单状态

```typescript
const [merchantName, setMerchantName] = useState('');
const [amountKRW, setAmountKRW] = useState('');
const [amountCNY, setAmountCNY] = useState('');
const [payer, setPayer] = useState('');
const [splitType, setSplitType] = useState<SplitType>('even');
const [splitAmong, setSplitAmong] = useState<string[]>([]);
const [treatedBy, setTreatedBy] = useState('');
const [icon, setIcon] = useState('💰');
```

### 初始化逻辑

```typescript
// 1. 初始化汇率服务
useEffect(() => {
  if (currentRate && !exchangeService.getCurrentRate()) {
    exchangeService['currentRate'] = currentRate;
  }
}, [currentRate]);

// 2. 初始化默认付款人(第一个旅行者)
useEffect(() => {
  if (travelers.length > 0 && !payer) {
    setPayer(travelers[0]);
  }
}, [travelers, payer]);

// 3. 初始化默认参与分摊人员(所有旅行者)
useEffect(() => {
  if (travelers.length > 0 && splitAmong.length === 0) {
    setSplitAmong(travelers);
  }
}, [travelers]);

// 4. 初始化默认请客的人(第一个旅行者)
useEffect(() => {
  if (travelers.length > 0 && !treatedBy) {
    setTreatedBy(travelers[0]);
  }
}, [travelers, treatedBy]);
```

## 关键方法

### toggleSplitAmong

切换参与分摊人员的选择状态:

```typescript
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
};
```

**特点:** 确保至少保留1人参与分摊,防止出现空数组。

### validateForm

完整的表单验证逻辑:

```typescript
const validateForm = (): boolean => {
  const newErrors: typeof errors = {};

  // 商家名称验证
  if (!merchantName.trim()) {
    newErrors.merchantName = '请输入商家名称';
  }

  // 金额验证
  const krwAmount = parseFloat(amountKRW);
  if (!amountKRW || isNaN(krwAmount) || krwAmount <= 0) {
    newErrors.amount = '请输入有效的金额';
  }

  // 付款人验证
  if (!payer) {
    newErrors.payer = '请选择付款人';
  }

  // 分摊逻辑验证
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
```

### handleAdd

处理添加交易:

```typescript
const handleAdd = () => {
  if (!validateForm()) {
    return; // 验证失败则不添加
  }

  const krwAmount = parseFloat(amountKRW);
  const cnyAmount = parseFloat(amountCNY);

  const transaction: Omit<Transaction, 'id' | 'timestamp' | 'date'> = {
    name: merchantName.trim(),
    amountKRW: krwAmount,
    amountCNY: cnyAmount,
    payer,
    splitType,
    icon,
    // 根据分摊类型添加相应字段
    ...(splitType === 'even' && { splitAmong }),
    ...(splitType === 'treat' && { treatedBy }),
  };

  onAdd(transaction);
};
```

## 响应式设计

- **模态框尺寸:** `max-w-md` (最大宽度 28rem / 448px)
- **内边距:** `p-8` (32px)
- **最大高度:** `max-h-[90vh]` (防止超出屏幕)
- **滚动:** 当内容超出时显示滚动条

## 可访问性

- **键盘导航:** 所有交互元素支持键盘操作
- **表单标签:** 每个输入框都有对应的 `<label>`
- **错误提示:** 清晰的错误消息和视觉反馈
- **必填标识:** 使用红色星号标记必填字段
- **焦点状态:** 所有可聚焦元素都有明确的焦点样式

## 性能优化

1. **React.memo:** 组件使用 `React.memo` 包装,避免不必要的重渲染
2. **动画优化:** 使用 `framer-motion` 的 GPU 加速动画
3. **条件渲染:** 使用条件渲染减少 DOM 节点数量

## 注意事项

1. **汇率服务:** 确保在使用前 `exchangeService` 已正确初始化
2. **旅行者列表:** 必须至少包含1个旅行者
3. **金额格式:** KRW 金额应为正数,CNY 自动保留2位小数
4. **ID生成:** 唯一ID、时间戳、日期由父组件负责生成
5. **数据持久化:** 组件不处理数据持久化,由父组件管理

## 未来改进

- [ ] 添加拍照收据功能
- [ ] 支持自定义emoji图标
- [ ] 添加常用商家快捷选择
- [ ] 支持多币种输入
- [ ] 添加交易备注字段
- [ ] 支持编辑已有交易记录

## 相关文件

- `SettingsModal.tsx`: 参考的UI设计风格
- `exchangeService.ts`: 汇率转换服务
- `types/trip.ts`: 类型定义
- `AddTransactionModal.example.tsx`: 使用示例
