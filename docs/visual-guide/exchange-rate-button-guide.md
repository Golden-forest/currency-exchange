# "记一笔"按钮视觉规范

## 按钮样式

### 位置
- 绝对定位在汇率卡片下方
- 距离底部: `-bottom-16` (约 4rem / 64px)
- 水平居中: `left-1/2 -translate-x-1/2`

### 尺寸
- 内边距: `px-6 py-2.5`
- 圆角: `rounded-full` (完全圆角)
- 文字大小: `text-sm`
- 文字粗细: `font-bold`

### 颜色
- 背景渐变: `bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3]`
  - 起始色: #FF6B81 (粉红色)
  - 结束色: #FF9FF3 (粉色)
- 文字颜色: `text-white` (白色)

### 阴影
- 默认: `shadow-lg`
- Hover: `hover:shadow-xl`

## 动画效果

### 进入动画
```javascript
initial={{ y: 20, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{
  type: "spring",
  stiffness: 300,
  damping: 25,
  duration: 0.3
}}
```
- 从下方 20px 处开始
- 透明度从 0 到 1
- Spring 弹性动画
- 持续时间: 约 0.3 秒

### 退出动画
```javascript
exit={{ y: 20, opacity: 0 }}
```
- 向下移动 20px
- 透明度降至 0
- 与进入动画对称

### 交互动画
- Hover: `hover:scale-105` (放大 5%)
- 点击: `active:scale-95` (缩小 5%)
- 过渡: `transition-all duration-200`

## 显示逻辑

### 显示条件
```typescript
showAddButton && rate && !isLoading && !error
```
- `showAddButton`: 状态为 true
- `rate`: 汇率值存在
- `!isLoading`: 不在加载中
- `!error`: 没有错误

### 自动隐藏
- 显示后 5 秒自动隐藏
- 点击按钮后立即隐藏
- 组件卸载时清理定时器

### 重新显示
- 汇率重新查询成功后重新显示
- 重置 5 秒计时器

## 交互行为

### 点击事件
```typescript
onClick={(e) => {
  e.stopPropagation(); // 阻止冒泡,不触发汇率刷新
  handleAddToLedger(); // 调用回调
}}
```

### 回调函数
```typescript
const handleAddToLedger = () => {
  if (onAddToLedger && rate) {
    onAddToLedger(rate); // 传递当前汇率
    setShowAddButton(false); // 立即隐藏
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current); // 清理定时器
    }
  }
};
```

## 响应式设计

### 桌面端
- 按钮宽度自适应内容
- 内边距: `px-6 py-2.5`
- 字体: `text-sm`

### 移动端
- 相同样式
- 触摸友好的尺寸
- 防止文字换行: `whitespace-nowrap`

## 可访问性

### 键盘导航
- 按钮是标准的 `<button>` 元素
- 支持 Tab 键聚焦
- 支持 Enter 键触发

### 屏幕阅读器
- 按钮文字: "记一笔"
- 语义化: 使用原生 button 元素
- 可以添加 `aria-label` 增强描述

## 视觉层次

### Z-Index
- 父容器: `relative`
- 按钮: `absolute`
- 默认在正常文档流之上

### 遮挡处理
- 按钮位置在卡片下方 (`-bottom-16`)
- 需要确保父容器有足够空间
- 需要确保不被其他元素遮挡

## 性能优化

### 动画性能
- 使用 Framer Motion 的 GPU 加速
- 只动画 `transform` 和 `opacity`
- 避免动画 `width`, `height`, `margin` 等

### 定时器管理
- 使用 `useRef` 存储 timer
- 组件卸载时清理
- 状态变化时清理旧的 timer
- 防止内存泄漏

## 浏览器兼容性

### CSS 特性
- `bg-gradient-to-r`: 渐变背景
- `rounded-full`: 圆角
- `shadow-lg`: 阴影
- `transform`: 变换

### JavaScript 特性
- `useState`: React Hooks
- `useEffect`: 副作用管理
- `useRef`: 引用管理
- Framer Motion: 动画库

## 设计规范参考

### 颜色
- 符合品牌色调
- 与现有 UI 一致
- 高对比度,易于识别

### 圆角
- 与现有按钮一致
- `rounded-full` 提供友好的视觉

### 阴影
- `shadow-lg` 提供深度感
- `hover:shadow-xl` 提供反馈

### 动画
- Spring 动画提供自然感
- 快速响应 (0.3s)
- 流畅的进入和退出

## 测试检查清单

### 功能测试
- [ ] 汇率成功后按钮显示
- [ ] 5秒后自动隐藏
- [ ] 点击触发回调
- [ ] 点击后立即隐藏
- [ ] 重新查询后重新显示

### 视觉测试
- [ ] 按钮位置正确
- [ ] 按钮样式正确
- [ ] 动画流畅
- [ ] Hover 效果
- [ ] 点击效果

### 边界测试
- [ ] 加载中不显示
- [ ] 错误时不显示
- [ ] 无回调时不报错
- [ ] 快速点击处理

### 性能测试
- [ ] 动画流畅 (60fps)
- [ ] 无内存泄漏
- [ ] 定时器正确清理
- [ ] 无不必要的重渲染

---

**最后更新:** 2026-02-06
**设计师:** Claude
**状态:** 已实现,待测试
