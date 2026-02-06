# 消费记录功能增强设计方案

**日期:** 2026-02-06
**状态:** 设计阶段

## 概述

本文档描述了对 TripLedgerCard 添加消费记录功能的四项关键增强:
1. 多币种输入支持
2. 汇率卡片与账本卡片联动
3. 成功反馈与防重复提交
4. 图标优化与自定义

---

## 1. 多币种输入功能

### 当前问题
- 添加消费记录时只能输入韩元(KRW)
- 不支持人民币或其他币种直接输入

### 解决方案

#### UI 变更
1. 金额输入框前增加币种选择下拉框
2. 下拉框选项: KRW(韩元)、CNY(人民币)
3. 选择币种后,输入框前缀符号相应变化(₩ 或 ¥)
4. 实时汇率转换: 输入任一币种,自动计算并显示另一币种

#### 数据流
```
用户选择币种 → 更新状态 currency
用户输入金额 → 根据当前 currency 解析金额
              → 调用 exchangeService 转换
              → 同时显示两种币种
```

#### 验证逻辑
- 必须输入金额(任一币种)
- 自动转换为 KRW 和 CNY 存储
- 如果汇率不可用,提示用户

#### 技术实现
- 新增状态: `currency: 'KRW' | 'CNY'`
- 修改 `handleKRWChange` 为 `handleAmountChange`,支持双币种
- 输入框显示根据 `currency` 动态调整

---

## 2. 卡片联动功能

### 功能描述
汇率查询成功后,在汇率卡片上显示"记一笔"按钮,点击后直接跳转到添加消费记录页面。

### 实现方案

#### 1. ExchangeRateCard 组件变更

**新增 Props:**
```typescript
type Props = {
  onAddToLedger?: (rate: number) => void;
};
```

**状态管理:**
- 查询成功后,设置 `showAddButton = true`
- 使用 `AnimatePresence` 实现滑入动画
- 5秒后自动设置 `showAddButton = false`

**UI 组件:**
- 从底部滑入的按钮容器
- 按钮文案: "记一笔"
- 样式: 渐变色背景 (from-[#FF6B81] to-[#FF9FF3])
- 圆角、阴影、hover 效果

#### 2. 页面级联动

**Page 组件变更:**
```typescript
// app/page.tsx 或主页面组件

const handleAddToLedger = (rate: number) => {
  // 1. 切换到账本卡片 (setCurrentCard(1))
  // 2. 打开添加记录 modal
  // 3. 传递汇率给 modal
};

// 传递给 ExchangeRateCard
<ExchangeRateCard onAddToLedger={handleAddToLedger} />
```

**TripLedgerCard 组件变更:**
```typescript
type Props = {
  // 新增: 支持外部触发添加记录
  initialRate?: number;
  autoOpenAddModal?: boolean;
};

// 当 autoOpenAddModal 为 true 时,自动打开 modal
useEffect(() => {
  if (autoOpenAddModal) {
    setShowAddModal(true);
  }
}, [autoOpenAddModal]);
```

#### 3. 数据流
```
汇率查询成功
  → ExchangeRateCard 设置 showAddButton=true
  → 动画显示"记一笔"按钮
  → 用户点击按钮
  → 调用 onAddToLedger(rate)
  → Page 组件切换到账本卡片 (setCurrentCard(1))
  → 设置 TripLedgerCard 的 autoOpenAddModal=true
  → 传递当前汇率
  → Modal 自动打开
```

#### 4. 时序控制
- 按钮显示时长: 5秒
- 使用 `setTimeout` 自动隐藏
- 组件卸载时清理 timer
- 用户点击按钮后立即隐藏

---

## 3. 成功反馈与防重复提交

### 功能描述
添加消费记录成功后,显示打勾动画,并防止用户重复点击。

### 实现方案

#### 1. 按钮状态机

```typescript
type ButtonState = 'normal' | 'submitting' | 'success';

const [buttonState, setButtonState] = useState<ButtonState>('normal');
```

#### 2. 各状态行为

**normal 状态:**
- 文案: "添加记录"
- 可点击
- 样式: `bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3]`

**submitting 状态:**
- 文案: "添加中..."
- 禁用: `disabled`
- 样式: `opacity-70 cursor-not-allowed`
- 可选: 显示 loading spinner

**success 状态:**
- 显示: 打勾图标 (✓)
- 禁用: `disabled`
- 样式: `bg-green-500`
- 动画: scale + fade

#### 3. 状态转换逻辑

```javascript
const handleAdd = async () => {
  // 1. 验证表单
  if (!validateForm()) return;

  // 2. 设置为 submitting,禁用按钮
  setButtonState('submitting');

  try {
    // 3. 执行添加操作
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟异步
    onAdd(transaction);

    // 4. 设置为 success
    setButtonState('success');

    // 5. 1秒后恢复,且不清空表单,不关闭 modal
    setTimeout(() => {
      setButtonState('normal');
      // 注意: 不调用 onClose(),留在当前页面
    }, 1000);

  } catch (error) {
    // 错误处理
    setButtonState('normal');
  }
};
```

#### 4. 视觉实现

**打勾动画 (Framer Motion):**
```jsx
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
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3 }}
    />
  </svg>
</motion.div>
```

**按钮样式动态切换:**
```jsx
<button
  onClick={handleAdd}
  disabled={buttonState !== 'normal'}
  className={`flex-1 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all ${
    buttonState === 'normal'
      ? 'bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white hover:shadow-xl active:scale-95'
      : buttonState === 'submitting'
      ? 'bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white opacity-70 cursor-not-allowed'
      : 'bg-green-500 text-white'
  }`}
>
  {buttonState === 'normal' && '添加记录'}
  {buttonState === 'submitting' && '添加中...'}
  {buttonState === 'success' && <CheckAnimation />}
</button>
```

#### 5. 防重复提交保护
- 按钮在 non-normal 状态时 `disabled`
- 表单验证通过后立即禁用
- 成功后保持禁用 1 秒
- 错误时恢复可点击状态

---

## 4. 图标优化与自定义

### 功能描述
删除难看的图标,优化布局间距,增加自定义图片上传功能。

### 实现方案

#### 1. 图标列表精简

**删除的图标:**
- 🚇、✈️、🏨、🎬、📷、🎵、💰、🏧、🚩、📌

**保留的图标:**
```javascript
const EMOJI_OPTIONS = [
  '🍜', '☕', '🍕', '🍔', '🍣', '🥐',
  '🚕', '🎫', '🛍️',
  '💊', '🎁', '🎮',
  '🏪', '⛽', '📍'
];
```

**总计:** 15 个预设图标

#### 2. 布局优化

**当前布局问题:**
- 8 列布局,在移动端显得拥挤
- 图标按钮过小 (w-10 h-10)
- 间距不足 (gap-2)

**优化后:**
```jsx
// 从
<div className="grid grid-cols-8 gap-2">

// 改为
<div className="grid grid-cols-6 gap-3">
```

**图标按钮尺寸:**
```jsx
// 从
<button className="w-10 h-10 ...">

// 改为
<button className="w-12 h-12 ...">
```

**视觉效果:**
- 每行 6 个图标,更宽松
- 按钮更大,更容易点击
- 间距增加,视觉更舒适

#### 3. 自定义图标按钮

**UI 组件:**
```jsx
{/* 在图标列表末尾 */}
<button
  type="button"
  onClick={handleImageUpload}
  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl
         border-2 border-dashed border-[#636E72] bg-[#F0F2F6]
         hover:bg-[#E9EDF2] hover:border-[#8B5CF6] transition-all"
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
```

#### 4. 图片上传处理

**文件选择:**
```javascript
const handleImageUpload = () => {
  fileInputRef.current?.click();
};

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
};
```

**图片压缩与存储:**
```javascript
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
      alert('图片过大,请选择更小的图片');
      return;
    }

    // 6. 加载现有自定义图标
    const existing = loadCustomIcons();
    if (existing.length >= 5) {
      alert('最多只能添加 5 个自定义图标,请先删除一些');
      return;
    }

    // 7. 保存新图标
    const newIcon = {
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
```

#### 5. 自定义图标存储

**存储结构:**
```typescript
interface CustomIcon {
  id: string;
  data: string; // base64 data URL
  createdAt: string;
}

// localStorage key: 'customIcons'
const storageKey = 'customIcons';
```

**加载自定义图标:**
```javascript
const loadCustomIcons = (): CustomIcon[] => {
  try {
    const data = localStorage.getItem('customIcons');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// 组件初始化
useEffect(() => {
  setCustomIcons(loadCustomIcons());
}, []);
```

#### 6. 图标选择逻辑

**合并显示:**
```jsx
{[...EMOJI_OPTIONS, ...customIcons.map(icon => icon.id)].map((item) => {
  const isCustom = customIcons.some(icon => icon.id === item);

  return (
    <button
      key={item}
      onClick={() => setIcon(item)}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
        icon === item
          ? 'bg-gradient-to-br from-[#FF6B81] to-[#FF9FF3] shadow-lg scale-110'
          : 'bg-[#F0F2F6] hover:bg-[#E9EDF2]'
      }`}
    >
      {isCustom ? (
        <img
          src={customIcons.find(i => i.id === item)!.data}
          alt="自定义图标"
          className="w-8 h-8 object-cover rounded"
        />
      ) : (
        <span className="text-xl">{item}</span>
      )}
    </button>
  );
})}
```

**删除自定义图标 (可选功能):**
```jsx
{/* 长按自定义图标显示删除按钮 */}
{isCustom && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteIcon(item);
    }}
    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full
           flex items-center justify-center text-white text-xs"
  >
    ×
  </button>
)}
```

#### 7. 限制与错误处理

**容量限制:**
- 最多 5 个自定义图标
- 单个图标最大 50KB
- 总容量约 250KB

**错误处理:**
- 文件类型验证
- 文件大小验证
- 存储空间检查
- 图片处理失败提示

**用户提示:**
```javascript
if (customIcons.length >= 5) {
  alert('最多只能添加 5 个自定义图标\n\n提示: 长按图标可以删除');
  return;
}
```

---

## 技术栈

- **UI 框架:** React + Framer Motion
- **存储:** localStorage
- **图片处理:** Canvas API + createImageBitmap
- **数据格式:** base64 Data URL

---

## 文件变更清单

### 需要修改的文件:

1. **src/components/TripLedgerCard/AddTransactionModal.tsx**
   - 添加币种选择功能
   - 实现按钮状态机
   - 优化图标布局
   - 添加自定义图标上传

2. **src/components/ExchangeRateCard.tsx**
   - 添加"记一笔"按钮
   - 实现动画效果
   - 添加 onAddToLedger 回调

3. **app/page.tsx** (或主页面组件)
   - 实现卡片联动逻辑
   - 传递汇率给账本卡片

4. **src/types/trip.ts** (如需要)
   - 更新 Transaction 类型定义

### 需要创建的文件:

1. **src/hooks/useCustomIcons.ts** (可选)
   - 封装自定义图标管理逻辑

---

## 测试计划

### 1. 多币种输入测试
- [ ] 选择 KRW,输入金额,验证 CNY 自动转换
- [ ] 选择 CNY,输入金额,验证 KRW 自动转换
- [ ] 验证表单提交时两种币种都正确存储
- [ ] 测试汇率不可用时的错误提示

### 2. 卡片联动测试
- [ ] 汇率查询成功后,按钮正确显示
- [ ] 点击"记一笔"按钮,正确切换到账本卡片
- [ ] Modal 自动打开且汇率正确传递
- [ ] 按钮 5 秒后自动消失
- [ ] 手动关闭 modal 后,联动不影响后续使用

### 3. 成功反馈测试
- [ ] 点击添加后,按钮进入 submitting 状态
- [ ] 按钮在 submitting 时禁用,无法重复点击
- [ ] 成功后显示打勾动画
- [ ] 1 秒后按钮恢复 normal 状态
- [ ] Modal 保持打开,表单不清空

### 4. 图标功能测试
- [ ] 验证难看图标已删除
- [ ] 验证布局改为 6 列,间距合理
- [ ] 点击"+"按钮,文件选择器打开
- [ ] 上传图片,正确压缩并存储
- [ ] 自定义图标显示在列表中
- [ ] 可以选择自定义图标
- [ ] 超过 5 个时正确提示
- [ ] 图片过大时正确拒绝

### 5. 边界情况测试
- [ ] 快速连续点击添加按钮
- [ ] 上传非图片文件
- [ ] localStorage 已满的情况
- [ ] 汇率为 0 或无效值的情况

---

## 实施优先级

### P0 (核心功能)
1. 多币种输入
2. 成功反馈与防重复提交

### P1 (用户体验增强)
3. 卡片联动
4. 图标布局优化

### P2 (高级功能)
5. 自定义图标上传

---

## 后续优化方向

1. **多币种扩展**
   - 支持更多币种 (USD, JPY 等)
   - 币种汇率历史记录

2. **自定义图标增强**
   - 图标编辑功能 (裁剪、滤镜)
   - 图标分类管理
   - 云端同步 (可选)

3. **联动增强**
   - 记账模板 (快速记录常用消费)
   - 智能分类建议

---

## 附录: 图标对比

### 删除前 (24 个)
```
🍜 ☕ 🍕 🍔 🍣 🥐
🚕 🚇 ✈️ 🏨 🎫 🛍️
💊 🎁 🎮 🎬 📸 🎵
💰 🏧 🏪 ⛽ 🚩 📍
```

### 删除后 (15 个)
```
🍜 ☕ 🍕 🍔 🍣 🥐
🚕 🎫 🛍️
💊 🎁 🎮
🏪 ⛽ 📍
```

### 新增自定义
```
... 用户上传的图片图标 ...
```

---

**文档版本:** 1.0
**最后更新:** 2026-02-06
