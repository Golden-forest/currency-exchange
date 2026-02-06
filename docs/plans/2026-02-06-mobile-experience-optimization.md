# 移动端体验优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 优化货币兑换应用的移动端体验，将卡片切换改为左右滑动，增强按钮点击反馈，优化手势动画效果，打造接近原生 App 的流畅体验。

**架构方案:**
1. 将现有的垂直滑动切换改为水平滑动切换，符合移动端主流交互习惯
2. 为语言切换、货币切换等按钮增强点击动画，添加旋转、缩放、颜色渐变等复合动画效果
3. 优化拖拽手势的跟手性、弹性回弹、边界反馈等细节，提升手势操作的真实感和流畅度

**技术栈:**
- Next.js 15 (React 19)
- Framer Motion (动画库，已集成)
- TypeScript
- Tailwind CSS

---

## Task 1: 创建可复用的动画按钮组件

**文件:**
- Create: `src/components/ui/AnimatedButton.tsx`
- Create: `src/components/ui/index.ts`

**Step 1: 编写组件类型定义和接口**

```typescript
// src/components/ui/AnimatedButton.tsx

import { MotionProps, motion } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export type AnimatedButtonVariant = 'primary' | 'secondary' | 'icon';
export type AnimatedButtonSize = 'sm' | 'md' | 'lg';

export interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AnimatedButtonVariant;
  size?: AnimatedButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

**Step 2: 实现 AnimatedButton 组件**

```typescript
// src/components/ui/AnimatedButton.tsx (续)

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const variantClasses = {
  primary: 'bg-gradient-to-tr from-[#0EA5E9] to-[#38BDF8] text-white shadow-glow-primary',
  secondary: 'bg-white text-[#64748B] shadow-soft-out-sm border border-gray-50',
  icon: 'w-12 h-12 bg-white rounded-2xl shadow-soft-out-sm flex items-center justify-center text-[#94A3B8] border border-gray-50',
};

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ variant = 'secondary', size = 'md', fullWidth = false, children, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{
          scale: 0.92,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className={`
          rounded-2xl font-bold
          ${variantClasses[variant]}
          ${size === 'sm' || size === 'md' ? variantClasses[size] : ''}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
```

**Step 3: 创建导出索引文件**

```typescript
// src/components/ui/index.ts

export { AnimatedButton } from './AnimatedButton';
export type { AnimatedButtonProps, AnimatedButtonVariant, AnimatedButtonSize } from './AnimatedButton';
```

**Step 4: 在 TranslationCard 中测试 AnimatedButton**

修改 `src/components/TranslationCard.tsx:619-630` 的复制按钮：

```typescript
// src/components/TranslationCard.tsx

import { AnimatedButton } from '@/components/ui';

// 在 renderResult 函数中替换复制按钮：
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleCopy}
  className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-[#64748B] shadow-soft-out-sm border border-gray-50 active:shadow-soft-in"
  title="复制"
>
  {/* 图标 */}
</motion.button>

// 改为：
<AnimatedButton
  variant="secondary"
  size="sm"
  onClick={handleCopy}
  className="w-11 h-11 p-0"
  title="复制"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
</AnimatedButton>
```

**Step 5: 测试按钮动画效果**

运行: `npm run dev`
在浏览器中打开 TranslationCard，点击复制按钮，观察：
- 按下时缩小到 0.92 倍
- 松开时回弹
- 过渡流畅

**Step 6: 提交组件**

```bash
git add src/components/ui/
git commit -m "feat: 创建可复用的动画按钮组件"
```

---

## Task 2: 优化语言切换按钮的旋转动画

**文件:**
- Modify: `src/components/TranslationCard.tsx:39-62, 306-318, 739-748`

**Step 1: 添加旋转状态管理**

在组件开头添加状态（`src/components/TranslationCard.tsx:39-62`）：

```typescript
// 在其他状态声明后添加：
/** 语言切换旋转动画状态 */
const [isSwapping, setIsSwapping] = useState(false);
```

**Step 2: 修改 handleSwapLanguages 函数触发动画**

修改 `src/components/TranslationCard.tsx:306-318`：

```typescript
const handleSwapLanguages = useCallback(() => {
  // 触发旋转动画
  setIsSwapping(true);

  swapLanguages();
  // 交换输入框的值
  if (targetText) {
    setInputValue(targetText);
  } else {
    setInputValue('');
  }
  // 清空本地状态（因为 swapLanguages 会处理）
  setLocalTargetText('');
  setLocalRomanization('');

  // 动画完成后重置状态
  setTimeout(() => setIsSwapping(false), 300);
}, [swapLanguages, targetText]);
```

**Step 3: 更新语言切换按钮动画**

修改 `src/components/TranslationCard.tsx:739-748`：

```typescript
{/* 交换按钮 */}
<motion.div
  whileHover={{ scale: 1.1, rotate: 180 }}
  whileTap={{ scale: 0.9 }}
  animate={{ rotate: isSwapping ? 360 : 0 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 17
  }}
  onClick={handleSwapLanguages}
  className="w-10 h-10 bg-[#0EA5E9] rounded-full shadow-glow-primary flex items-center justify-center text-white cursor-pointer"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
</motion.div>
```

**Step 4: 测试语言切换动画**

运行: `npm run dev`
在 TranslationCard 中点击语言切换按钮：
- 观察按钮旋转 360 度
- 语言文本同时更新
- 动画流畅，时间约 300ms

**Step 5: 提交动画优化**

```bash
git add src/components/TranslationCard.tsx
git commit -m "feat: 增强语言切换按钮旋转动画"
```

---

## Task 3: 将卡片切换从垂直滑动改为水平滑动

**文件:**
- Modify: `app/page.tsx:89-107, 140-150, 172-184`

**Step 1: 修改动画 variants 为水平方向**

修改 `app/page.tsx:89-107`：

```typescript
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',  // 改为 x 轴
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',  // 改为 x 轴
    opacity: 0,
    scale: 0.95,
  }),
};
```

**Step 2: 修改拖拽配置为水平方向**

修改 `app/page.tsx:140-150`：

```typescript
<motion.div
  key={activeCardIndex}
  custom={direction}
  variants={variants}
  initial="enter"
  animate="center"
  exit="exit"
  transition={{
    x: {
      type: "spring",
      stiffness: 400,      // 增加刚度
      damping: 25,         // 优化阻尼
      mass: 0.5            // 添加质量
    },
    opacity: { duration: 0.25, ease: "easeOut" },
    scale: { duration: 0.35, ease: "easeInOut" }
  }}
  drag="x"                                    // 改为横向
  dragConstraints={{ left: 0, right: 0 }}     // 水平约束
  dragElastic={0.35}                          // 增加弹性
  dragTransition={{
    bounceDamping: 20,
    bounceStiffness: 300,
    power: 0.3,
    timeConstant: 200
  }}
  onDragEnd={(e, { offset, velocity }) => {
    const swipeConfidenceThreshold = 60;      // 降低阈值
    const swipe = offset.x;

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  }}
  className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
>
```

**Step 3: 将分页指示器移到底部水平排列**

修改 `app/page.tsx:172-184`：

```typescript
{/* Pagination Dots */}
<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
  {CARDS.map((_, i) => (
    <div
      key={i}
      onClick={() => {
        setDirection(i > activeCardIndex ? 1 : -1);
        setActiveCardIndex(i);
      }}
      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
        activeCardIndex === i
          ? 'bg-[#8B5CF6] w-6 shadow-glow-primary'
          : 'bg-[#D1D9E6]'
      }`}
    />
  ))}
</div>
```

**Step 4: 添加手势冲突检测**

在主页面组件中添加手势检测函数（`app/page.tsx:15` 之后）：

```typescript
// 在组件定义内，useState 之后添加：
const detectGesture = (offset: {x: number, y: number}): 'horizontal' | 'vertical' => {
  const angle = Math.abs(Math.atan2(offset.y, offset.x) * 180 / Math.PI);
  return angle < 30 || angle > 150 ? 'horizontal' : 'vertical';
};
```

**Step 5: 测试水平滑动效果**

运行: `npm run dev`
在浏览器或移动设备中测试：
- 左右滑动切换卡片
- 观察动画方向为水平
- 分页指示器在底部居中
- 滑动阻尼效果自然

**Step 6: 提交滑动方向修改**

```bash
git add app/page.tsx
git commit -m "feat: 将卡片切换改为左右滑动并优化手势动画"
```

---

## Task 4: 添加快捷短语点击动画增强

**文件:**
- Modify: `src/components/TranslationCard.tsx:708-726`

**Step 1: 增强快捷短语卡片动画**

修改 `src/components/TranslationCard.tsx:708-726`：

```typescript
<div className="flex gap-3 px-1 overflow-x-auto pb-2 scrollbar-hide pt-2">
  {/* 动态渲染快捷短语 */}
  {quickPhrases.map((phrase) => (
    <motion.div
      key={phrase.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{
        scale: 0.95,
        rotate: -5,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      onClick={() => handleQuickPhrase(phrase)}
      className="bg-white/90 rounded-[2.5rem] p-3 flex items-center flex-shrink-0 min-w-[140px] border border-white cursor-pointer"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.3,
          repeat: 0,
        }}
        className="text-[#0EA5E9] text-[10px] mr-2.5"
      >
        ▶
      </motion.div>
      <div>
        <div className="font-bold text-[#2D3436] text-xs sm:text-sm">{phrase.zh}</div>
        <div className="text-[9px] sm:text-[10px] text-[#A4B0BE] font-medium">{phrase.romanization}</div>
      </div>
    </motion.div>
  ))}
</div>
```

**Step 2: 测试快捷短语动画效果**

运行: `npm run dev`
在 TranslationCard 中点击快捷短语：
- 卡片轻微倾斜
- 播放图标跳动
- 整体缩放反馈

**Step 3: 提交动画增强**

```bash
git add src/components/TranslationCard.tsx
git commit -m "feat: 增强快捷短语点击动画效果"
```

---

## Task 5: 优化卡片切换边界手势反馈

**文件:**
- Modify: `app/page.tsx:16-87`

**Step 1: 添加边界状态检测**

在主页面组件中添加边界检测（`app/page.tsx:16` 之后）：

```typescript
export default function Home() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // 边界状态检测
  const isAtFirstCard = activeCardIndex === 0;
  const isAtLastCard = activeCardIndex === CARDS.length - 1;
```

**Step 2: 修改拖拽约束为条件性边界**

修改 `app/page.tsx:140-150` 中的 dragConstraints：

```typescript
drag="x"
dragConstraints={
  isAtFirstCard || isAtLastCard
    ? { left: -50, right: 50 }      // 边界时允许少量拖拽
    : { left: 0, right: 0 }          // 正常约束在原点
}
dragElastic={isAtFirstCard || isAtLastCard ? 0.1 : 0.35}
```

**Step 3: 测试边界手势反馈**

运行: `npm run dev`
在移动设备或浏览器模拟器中测试：
- 在第一张卡片向左滑动，观察阻尼效果
- 在最后一张卡片向右滑动，观察阻尼效果
- 松开后卡片回弹到原位

**Step 4: 提交边界反馈优化**

```bash
git add app/page.tsx
git commit -m "feat: 添加卡片切换边界手势反馈"
```

---

## Task 6: 全局触摸样式优化

**文件:**
- Modify: `app/globals.css` 或创建 `src/styles/touch.css`

**Step 1: 添加触摸优化样式**

```css
/* 在 app/globals.css 末尾添加 */

/* 禁用默认触摸行为，提升手势响应 */
.touch-optimized {
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* 拖拽时的光标样式 */
.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

/* 移除移动端点击高亮 */
.no-tap-highlight {
  -webkit-tap-highlight-color: transparent;
}

/* 优化触摸响应延迟 */
@media (pointer: coarse) {
  * {
    touch-action: manipulation;
  }
}
```

**Step 2: 在主页面应用触摸优化类**

修改 `app/page.tsx:124`：

```typescript
return (
  <main className={`h-screen w-full ${getBackgroundGradient()} overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 relative touch-optimized transition-all duration-500`}>
```

**Step 3: 测试触摸体验优化**

运行: `npm run dev`
在移动设备中测试：
- 点击无高亮闪烁
- 拖拽时光标变化
- 手势响应延迟降低

**Step 4: 提交触摸样式优化**

```bash
git add app/globals.css app/page.tsx
git commit -m "style: 添加全局触摸优化样式"
```

---

## Task 7: 编写测试文档和验证清单

**文件:**
- Create: `docs/mobile-optimization-testing.md`

**Step 1: 创建测试文档**

```markdown
# 移动端优化测试清单

## 测试环境
- [ ] Chrome DevTools 移动端模拟器
- [ ] 真实 iOS 设备（Safari）
- [ ] 真实 Android 设备（Chrome）

## 功能测试

### 卡片切换
- [ ] 左右滑动切换卡片流畅
- [ ] 动画方向为水平
- [ ] 分页指示器在底部居中
- [ ] 快速滑动响应灵敏
- [ ] 缓慢拖拽有弹性反馈

### 边界手势
- [ ] 第一张卡片向左滑动有阻尼
- [ ] 最后一张卡片向右滑动有阻尼
- [ ] 松开后卡片回弹到原位

### 按钮动画
- [ ] 语言切换按钮点击旋转 360 度
- [ ] 复制按钮点击缩放反馈
- [ ] 播放按钮点击缩放反馈
- [ ] 快捷短语点击倾斜效果
- [ ] 所有按钮动画流畅

### 手势冲突
- [ ] 快捷短语横向滚动不触发卡片切换
- [ ] 文本输入时不会误触发卡片切换

## 性能测试
- [ ] 动画帧率保持 60fps
- [ ] 无卡顿或掉帧
- [ ] 内存占用正常

## 兼容性测试
- [ ] iOS Safari 正常工作
- [ ] Android Chrome 正常工作
- [ ] 微信内置浏览器正常工作
```

**Step 2: 提交测试文档**

```bash
git add docs/mobile-optimization-testing.md
git commit -m "docs: 添加移动端优化测试清单"
```

---

## Task 8: 最终集成测试和文档整理

**Step 1: 运行完整测试套件**

```bash
npm run build
npm run dev
```

验证：
- 构建成功无错误
- 所有功能正常工作
- TypeScript 类型检查通过

**Step 2: 更新 README 文档**

在项目根目录 `README.md` 中添加移动端优化说明：

```markdown
## 移动端体验优化

本项目针对移动端进行了以下优化：

- ✅ 左右滑动切换卡片，符合移动端交互习惯
- ✅ 按钮点击动画增强，提供清晰的视觉反馈
- ✅ 手势动画优化，包括弹性回弹、边界反馈等
- ✅ 全局触摸样式优化，降低响应延迟

详细实施计划见：[移动端优化实施计划](./docs/plans/2026-02-06-mobile-experience-optimization.md)
```

**Step 3: 最终提交**

```bash
git add README.md
git commit -m "docs: 更新 README 添加移动端优化说明"

# 打标签
git tag -a v1.1.0 -m "移动端体验优化版本"
git push origin main --tags
```

---

## 总结

完成所有任务后，你的货币兑换应用将拥有：

1. **流畅的卡片切换体验**：左右滑动切换，符合主流 App 习惯
2. **丰富的按钮动画**：语言切换旋转、快捷短语倾斜等复合动画
3. **细腻的手势反馈**：弹性回弹、边界阻尼、跟手性优化
4. **专业的触摸体验**：禁用点击高亮、降低延迟、光标反馈

整个实施过程遵循 TDD 原则，每个功能都有明确的测试步骤，频繁提交确保代码质量。
