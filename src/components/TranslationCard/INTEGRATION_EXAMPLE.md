# TranslationCard 弹窗组件集成指南

## 概述

本文档展示如何在 `TranslationCard.tsx` 主组件中集成 `QuickPhrasesModal` 和 `HistoryModal`。

## 组件文件

- `QuickPhrasesModal.tsx` - 快捷短语弹窗
- `HistoryModal.tsx` - 翻译历史弹窗
- `index.ts` - 组件导出索引

## QuickPhrasesModal 集成

### 1. 导入组件

```tsx
import { QuickPhrasesModal } from '@/components/TranslationCard';
```

### 2. 添加状态

```tsx
const [isQuickPhrasesModalOpen, setIsQuickPhrasesModalOpen] = useState(false);
```

### 3. 添加处理函数

```tsx
const handleOpenQuickPhrases = () => {
  setIsQuickPhrasesModalOpen(true);
};

const handlePhraseSelect = (phrase: string) => {
  // 使用选中的短语
  setInputValue(phrase);
  setSourceText(phrase);
  translate(phrase);
};

const handleCloseQuickPhrases = () => {
  setIsQuickPhrasesModalOpen(false);
};
```

### 4. 修改 "View All" 按钮

在快捷短语区域的 "View All" 按钮上添加点击事件：

```tsx
<span
  className="text-[11px] font-bold text-[#1ABC9C] cursor-pointer hover:underline"
  onClick={handleOpenQuickPhrases}
>
  View All
</span>
```

### 5. 渲染弹窗

在 `TranslationCard` 组件的返回 JSX 中添加：

```tsx
return (
  <div className="w-full max-w-lg bg-white/90 glass-container rounded-[3.5rem] p-6 sm:p-8 shadow-soft-out-lg relative overflow-hidden h-full flex flex-col border border-white/50">
    {/* 现有内容... */}

    {/* 快捷短语弹窗 */}
    <QuickPhrasesModal
      isOpen={isQuickPhrasesModalOpen}
      onClose={handleCloseQuickPhrases}
      onPhraseSelect={handlePhraseSelect}
    />
  </div>
);
```

## HistoryModal 集成

### 1. 导入组件

```tsx
import { HistoryModal } from '@/components/TranslationCard';
```

### 2. 添加状态

```tsx
const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
```

### 3. 添加处理函数

```tsx
const handleOpenHistory = () => {
  setIsHistoryModalOpen(true);
};

const handleHistorySelect = (item: TranslationHistory) => {
  // 显示历史记录的翻译结果
  setSourceText(item.sourceText);
  setTargetText(item.targetText);
  setRomanization(item.romanization || '');
  setSourceLang(item.sourceLang);
  setTargetLang(item.targetLang);
};

const handleCloseHistory = () => {
  setIsHistoryModalOpen(false);
};
```

### 4. 修改历史图标按钮

在卡片右上角的历史图标按钮上添加点击事件：

```tsx
<button
  className="w-12 h-12 bg-white rounded-full shadow-soft-out-sm flex items-center justify-center text-[#636E72] active:shadow-soft-in transition-all"
  onClick={handleOpenHistory}
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</button>
```

### 5. 渲染弹窗

在 `TranslationCard` 组件的返回 JSX 中添加：

```tsx
return (
  <div className="w-full max-w-lg bg-white/90 glass-container rounded-[3.5rem] p-6 sm:p-8 shadow-soft-out-lg relative overflow-hidden h-full flex flex-col border border-white/50">
    {/* 现有内容... */}

    {/* 快捷短语弹窗 */}
    <QuickPhrasesModal
      isOpen={isQuickPhrasesModalOpen}
      onClose={handleCloseQuickPhrases}
      onPhraseSelect={handlePhraseSelect}
    />

    {/* 翻译历史弹窗 */}
    <HistoryModal
      isOpen={isHistoryModalOpen}
      onClose={handleCloseHistory}
      history={history}
      onDeleteItem={deleteHistoryItem}
      onClearAll={clearHistory}
      onSelectHistory={handleHistorySelect}
    />
  </div>
);
```

## 完整示例

```tsx
'use client';

import { useState } from 'react';
import { TranslationCard as BaseTranslationCard } from '@/components/TranslationCard';
import { QuickPhrasesModal } from '@/components/TranslationCard';
import { HistoryModal } from '@/components/TranslationCard';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationHistory } from '@/types/translation';

export function TranslationCard() {
  const {
    sourceText,
    setSourceText,
    targetText,
    setTargetText,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    romanization,
    setRomanization,
    isLoading,
    error,
    history,
    translate,
    swapLanguages,
    clearHistory,
    deleteHistoryItem,
    clearError,
  } = useTranslation({
    initialSourceLang: 'zh',
    initialTargetLang: 'ko',
    loadHistory: true,
  });

  // 弹窗状态
  const [isQuickPhrasesModalOpen, setIsQuickPhrasesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 快捷短语弹窗处理
  const handleOpenQuickPhrases = () => setIsQuickPhrasesModalOpen(true);
  const handleCloseQuickPhrases = () => setIsQuickPhrasesModalOpen(false);
  const handlePhraseSelect = (phrase: string) => {
    setSourceText(phrase);
    translate(phrase);
  };

  // 历史弹窗处理
  const handleOpenHistory = () => setIsHistoryModalOpen(true);
  const handleCloseHistory = () => setIsHistoryModalOpen(false);
  const handleHistorySelect = (item: TranslationHistory) => {
    setSourceText(item.sourceText);
    setTargetText(item.targetText);
    setRomanization(item.romanization || '');
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
  };

  return (
    <>
      {/* 原有的 TranslationCard 内容 */}
      <BaseTranslationCard
        // ...props
      />

      {/* 快捷短语弹窗 */}
      <QuickPhrasesModal
        isOpen={isQuickPhrasesModalOpen}
        onClose={handleCloseQuickPhrases}
        onPhraseSelect={handlePhraseSelect}
      />

      {/* 翻译历史弹窗 */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistory}
        history={history}
        onDeleteItem={deleteHistoryItem}
        onClearAll={clearHistory}
        onSelectHistory={handleHistorySelect}
      />
    </>
  );
}
```

## 功能特性

### QuickPhrasesModal

- ✅ 6 个分类标签（横向滚动）
- ✅ 每个分类显示 8-15 句短语
- ✅ 点击短语 → 使用并关闭弹窗
- ✅ 长按短语 → 收藏/取消收藏
- ✅ 收藏状态持久化（LocalStorage）
- ✅ Neumorphism 设计风格
- ✅ Framer Motion 动画
- ✅ 响应式设计（移动端适配）

### HistoryModal

- ✅ 显示最近 20 条翻译记录
- ✅ 每条显示：源文本 + 翻译结果 + 时间
- ✅ 点击记录 → 重新显示结果
- ✅ 悬停显示删除按钮
- ✅ 清空全部按钮（带二次确认）
- ✅ Neumorphism 设计风格
- ✅ Framer Motion 动画
- ✅ 空状态提示
- ✅ 智能时间格式化

## 数据流

```
TranslationCard (主组件)
    │
    ├── useTranslation Hook
    │   ├── sourceText, targetText
    │   ├── history (来自 LocalStorage)
    │   ├── translate()
    │   ├── deleteHistoryItem()
    │   └── clearHistory()
    │
    ├── QuickPhrasesModal
    │   ├── isOpen (控制显示/隐藏)
    │   ├── onClose (关闭弹窗)
    │   └── onPhraseSelect (选择短语 → 调用 translate())
    │
    └── HistoryModal
        ├── isOpen (控制显示/隐藏)
        ├── onClose (关闭弹窗)
        ├── history (显示历史列表)
        ├── onDeleteItem (删除单条 → deleteHistoryItem())
        ├── onClearAll (清空全部 → clearHistory())
        └── onSelectHistory (选择记录 → 显示结果)
```

## 样式说明

### Neumorphism 阴影类

- `shadow-soft-out-sm` - 轻微外凸效果
- `shadow-soft-out-md` - 中等外凸效果
- `shadow-soft-out-lg` - 强烈外凸效果
- `shadow-glow-primary` - 绿色发光效果
- `shadow-glow-error` - 红色发光效果

### 颜色方案

- 主色调：`#1ABC9C` (绿色)
- 次要色：`#2D3436` (深灰)
- 文字色：`#636E72` (中灰)
- 边框色：`#A4B0BE` (浅灰)
- 背景色：`#F0F2F6` (极浅灰)
- 错误色：`#FF6B81` (红色)

## 注意事项

1. **LocalStorage 持久化**：收藏的短语会保存在 `favorite_phrases` 键下
2. **历史记录限制**：最多显示最近 20 条记录
3. **长按检测**：长按时间为 500ms
4. **确认清空**：清空历史有 3 秒的确认窗口
5. **响应式设计**：所有组件都支持移动端和桌面端

## 后续优化

- [ ] 添加短语搜索功能
- [ ] 支持自定义短语
- [ ] 历史记录导出功能
- [ ] 短语收藏夹管理
- [ ] 翻译记录统计分析
