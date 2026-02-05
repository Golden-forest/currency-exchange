# SettingsModal 组件

## 功能说明

SettingsModal 是旅行账本的设置模态框组件，用于配置旅行基本信息和预算。

## 主要功能

### 1. 表单字段
- **旅行者姓名**：逗号分隔的文本输入框，支持多个旅行者
- **总预算**：韩元(KRW)数值输入框，实时显示人民币转换
- **旅行地点**：文本输入框，记录旅行目的地
- **当前汇率**：只读显示，自动从汇率服务获取

### 2. 验证逻辑
- ✅ 旅行者至少 2 人
- ✅ 总预算必须大于 0
- ✅ 姓名不能为空
- ✅ 地点不能为空

### 3. 用户体验
- ✅ 实时表单验证和错误提示
- ✅ 动态显示旅行者数量
- ✅ 自动计算预算的人民币等值
- ✅ 点击背景关闭模态框
- ✅ Neumorphism 设计风格
- ✅ 平滑的动画过渡效果

## 技术实现

### Props 类型
```typescript
type Props = {
  settings: TripSettings | null;  // 当前设置，首次使用为 null
  onSave: (settings: TripSettings) => void;  // 保存回调
  onClose: () => void;  // 关闭回调
}
```

### 汇率获取

组件从 `exchangeService` 获取汇率：

```typescript
// 从汇率服务获取当前汇率
const rate = exchangeService.getCurrentRate();
setCurrentRate(rate);
```

**获取方式：**
1. 首次加载时从 `exchangeService.getCurrentRate()` 获取
2. 如果汇率服务未加载，使用默认值 0.0053 (1 CNY ≈ 189 KRW)
3. 显示格式："1 CNY = 189.00 KRW"

### 表单验证流程

```typescript
const validateForm = (): boolean => {
  // 1. 解析旅行者姓名
  const travelers = travelersStr
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // 2. 验证旅行者数量
  if (travelers.length < 2) {
    newErrors.travelers = '旅行者至少需要2人';
  }

  // 3. 验证预算
  const budget = parseFloat(totalBudget);
  if (budget <= 0) {
    newErrors.budget = '预算必须大于0';
  }

  // 4. 验证地点
  if (!location.trim()) {
    newErrors.location = '请输入旅行地点';
  }

  return Object.keys(newErrors).length === 0;
};
```

### UI 设计特点

#### Neumorphism 风格
- **输入框**：使用 `shadow-soft-in` 内阴影效果
- **模态框**：圆角 3rem，白色背景，外阴影
- **背景遮罩**：半透明黑色 + 背景模糊效果
- **按钮**：渐变色 + 悬停阴影 + 点击缩放

#### 动画效果
- **进入动画**：淡入 + 缩放 (opacity: 0→1, scale: 0.9→1)
- **退出动画**：淡出 + 缩放 (opacity: 1→0, scale: 1→0.9)
- **过渡时长**：200ms

#### 响应式设计
- 模态框最大宽度：max-w-md (28rem)
- 移动端适配：padding-4 防止边缘溢出
- 自适应高度：内容自动滚动

## 使用示例

### 基础用法

```tsx
import { useState } from 'react';
import { SettingsModal } from '@/components/TripLedgerCard/SettingsModal';
import { TripSettings } from '@/types/trip';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState<TripSettings | null>(null);

  const handleSave = (newSettings: TripSettings) => {
    setSettings(newSettings);
    console.log('设置已保存:', newSettings);
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        打开设置
      </button>

      {showModal && (
        <SettingsModal
          settings={settings}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

### 与 localStorage 集成

```tsx
import { useLocalStorage } from '@/hooks/useLocalStorage';

function MyComponent() {
  const [settings, setSettings] = useLocalStorage<TripSettings | null>(
    'tripSettings',
    null
  );

  // 首次使用自动弹出
  useEffect(() => {
    if (!settings) {
      setShowSettings(true);
    }
  }, [settings]);

  return (
    <>
      {/* ... */}
      <SettingsModal
        settings={settings}
        onSave={setSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
```

## 数据结构

### TripSettings 类型

```typescript
type TripSettings = {
  travelers: string[];        // 旅行者姓名数组
  totalBudget: number;        // 总预算(KRW)
  currentRate: number;        // 汇率(1 CNY = ? KRW)
  location: string;           // 旅行地点
};
```

### 示例数据

```typescript
const exampleSettings: TripSettings = {
  travelers: ['张三', '李四', '王五', '赵六'],
  totalBudget: 2000000,  // 200万韩元
  currentRate: 0.0053,   // 1 CNY ≈ 189 KRW
  location: 'Seoul, South Korea',
};
```

## 文件位置

```
src/components/TripLedgerCard/SettingsModal.tsx
```

## 依赖项

- React
- framer-motion (动画)
- @/types/trip (类型定义)
- @/services/exchange (汇率服务)

## 测试建议

### 手动测试清单

1. **验证功能**
   - [ ] 输入少于2人时显示错误
   - [ ] 输入0或负数预算时显示错误
   - [ ] 不输入地点时显示错误
   - [ ] 所有字段正确时可以保存

2. **UI 测试**
   - [ ] 模态框居中显示
   - [ ] 背景遮罩半透明
   - [ ] 点击背景关闭模态框
   - [ ] 输入框内阴影效果正常

3. **交互测试**
   - [ ] 实时显示旅行者数量
   - [ ] 实时显示人民币等值
   - [ ] 动画流畅无卡顿
   - [ ] 按钮点击有反馈

4. **边界情况**
   - [ ] 汇率未加载时的默认值
   - [ ] 超长旅行者姓名
   - [ ] 超大预算数值
   - [ ] 特殊字符输入

## 常见问题

### Q: 汇率显示为"汇率加载中..."？
**A:** 确保 exchangeService 已经初始化并成功获取汇率。检查是否在组件中使用 useExchangeRate hook。

### Q: 如何修改默认汇率？
**A:** 在 SettingsModal.tsx 中修改默认值：
```typescript
const rate = currentRate || 0.0053; // 修改这个值
```

### Q: 如何添加更多验证规则？
**A:** 在 validateForm 函数中添加新的验证逻辑。

### Q: 能否支持更多货币？
**A:** 当前仅支持 KRW，如需支持其他货币，需要修改类型定义和 UI。

## 更新日志

### v1.0.0 (2026-02-05)
- ✅ 初始版本
- ✅ 实现基础表单字段
- ✅ 表单验证逻辑
- ✅ Neumorphism UI 设计
- ✅ 汇率自动获取
- ✅ localStorage 持久化

## 作者

旅行账本功能实现计划 - Phase 3

## 许可

MIT
