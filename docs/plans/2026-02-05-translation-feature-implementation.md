# 翻译功能实现计划

**创建日期**: 2026-02-05
**项目**: currency-exchange
**功能**: Translation Card 翻译功能完整实现

---

## 📋 项目背景

用户需要在韩国旅行时快速进行中韩互译，当前 TranslationCard 组件只有静态 UI，需要实现完整的翻译功能，包括文本输入、语音识别、图片 OCR 和快捷短语系统。

---

## 🎯 核心设计决策（通过头脑风暴确定）

### 1. 翻译服务策略
**选择**: D - 混合方案（离线短语库 + Google API）
- ✅ **离线短语库**: 预置 50-100 句旅行常用语，覆盖 80% 场景，零成本
- ✅ **Google Translate API**: 处理剩余 20% 复杂句子，每月免费 50 万字符
- 💰 **成本**: 几乎零成本（离线优先 + API 免费额度）
- ⚡ **性能**: 离线匹配 < 50ms，API 调用 1-2s

### 2. 语音输入方案
**选择**: A - Web Speech API (SpeechRecognition)
- ✅ 完全免费，浏览器原生支持
- ✅ 识别准确率对旅行场景足够
- ✅ 可 fallback 到文本输入
- ⚠️ 需要用户授权麦克风权限

### 3. 图片 OCR 方案
**选择**: D - 相册图片 OCR（Tesseract.js）
- ✅ 纯前端实现，无需后端
- ✅ 免费开源
- 📱 符合实际使用场景（拍照后从相册选择）
- 🔧 后期可升级为 Google Cloud Vision（更好准确率）

### 4. 快捷短语系统
**选择**: D - 预置分类短语库 + 用户收藏
- ✅ 新用户立即可用（预置 50+ 句）
- ✅ 老用户越用越顺手（收藏功能）
- 📦 按场景分类：餐厅、购物、交通、紧急、住宿、问候

---

## 🏗️ 整体架构

```
TranslationCard.tsx (主 UI 组件)
    │
    ├── useTranslation Hook (翻译逻辑)
    │       │
    │       └── translationService.ts
    │           ├── searchOfflinePhrases() - 离线短语匹配
    │           ├── callGoogleTranslate() - API 翻译
    │           └── translateText() - 主翻译函数（智能路由）
    │
    ├── useSpeechRecognition Hook (语音识别)
    │       └── speechService.ts (Web Speech API 封装)
    │
    ├── ocrService.ts (Tesseract.js OCR)
    │
    ├── ttsService.ts (语音合成)
    │
    └── phraseStorage.ts (LocalStorage 存储)
```

---

## 📊 数据结构与状态管理

### TranslationState 接口
```typescript
interface TranslationState {
  // 输入相关
  sourceText: string;           // 用户输入的文本
  targetText: string;           // 翻译结果
  sourceLang: 'zh' | 'ko';      // 源语言
  targetLang: 'zh' | 'ko';      // 目标语言

  // UI 状态
  isLoading: boolean;           // 翻译中
  inputMode: 'text' | 'voice';  // 输入模式

  // 快捷短语
  quickPhrases: Phrase[];       // 当前显示的短语
  selectedCategory: string;     // 选中的分类

  // 历史记录
  history: TranslationHistory[]; // 最近翻译

  // 错误处理
  error: string | null;         // 错误信息
}
```

### 翻译流程
```
用户输入/语音
    ↓
1. 验证输入 (空? 长度?)
    ↓
2. 搜索离线短语库
    ↓ (匹配)
   直接返回结果
    ↓ (未匹配)
3. 调用 Google API
    ↓
4. 保存历史 + 缓存
    ↓
   显示结果 + 可播放
```

---

## 🎮 按键功能映射

### 现有 UI 组件
文件位置: `src/components/TranslationCard.tsx`

### 按键功能清单

#### 1️⃣ Type 按钮（键盘输入）
- **位置**: 底部左侧
- **功能**: 切换到文本输入模式
- **行为**:
  - 点击显示文本输入框（`<textarea>` 或 `<input>`）
  - 自动聚焦，调起移动端键盘
  - 支持实时翻译（debounce 500ms）或手动翻译按钮

#### 2️⃣ 麦克风按钮（语音输入）
- **位置**: 底部中央大圆按钮
- **功能**: 启动 Web Speech API 语音识别
- **实现**:
  ```typescript
  const startVoiceRecognition = () => {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = sourceLang === 'zh' ? 'zh-CN' : 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSourceText(transcript);
      if (event.results[0].isFinal) {
        translateText(transcript);
      }
    };
  };
  ```
- **错误处理**:
  - 浏览器不支持 → 提示 + 切换到文本输入
  - 权限被拒绝 → 显示设置引导
  - 识别超时 → 提示重试

#### 3️⃣ Scan 按钮（图片 OCR）
- **位置**: 底部右侧
- **功能**: 从相册选择图片进行 OCR 识别
- **实现**:
  ```typescript
  const handleImageUpload = async (file: File) => {
    const text = await ocrService.extractText(file);
    if (text) {
      setSourceText(text);
      translateText(text);
    }
  };
  ```
- **技术**: Tesseract.js
  ```bash
  npm install tesseract.js
  ```

#### 4️⃣ 语言切换按钮（中间 ↔️）
- **位置**: 语言选择器中间的圆形按钮
- **功能**: 交换源语言和目标语言
- **复用设计**: `src/components/CurrencyConverterCard.tsx:55-68`
  ```typescript
  <motion.div
    whileHover={{ scale: 1.1, rotate: 180 }}
    whileTap={{ scale: 0.9 }}
    className="w-10 h-10 bg-[#1ABC9C] rounded-full shadow-glow-primary ..."
  >
    <svg>...</svg>
  </motion.div>
  ```
- **行为**:
  - 点击交换 `sourceLang` 和 `targetLang`
  - 如果有翻译结果，也交换显示
  - 视觉反馈：按钮旋转 180 度

#### 5️⃣ 快捷短语卡片（Quick Phrases）
- **位置**: 快捷短语区域（当前显示 2 个）
- **功能**: 点击直接使用预置短语
- **行为**:
  - 点击短语 → 填入输入框 → 自动翻译
  - 长按 → 添加到收藏
  - 显示: 中文、韩文、罗马音

#### 6️⃣ 播放按钮（结果区）
- **位置**: 翻译结果右下角，绿色圆形按钮
- **功能**: 朗读翻译结果（韩语/中文）
- **实现**: Web Speech Synthesis API
  ```typescript
  const speak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ko' ? 'ko-KR' : 'zh-CN';
    speechSynthesis.speak(utterance);
  };
  ```

#### 7️⃣ 复制按钮（结果区）
- **位置**: 翻译结果右下角，白色方形按钮
- **功能**: 复制翻译结果到剪贴板
- **行为**:
  ```typescript
  const copyToClipboard = () => {
    navigator.clipboard.writeText(targetText);
    showToast('已复制到剪贴板');
  };
  ```

#### 8️⃣ View All（快捷短语区）
- **位置**: 快捷短语标题右侧
- **功能**: 打开完整短语库 Modal
- **Modal 内容**:
  - 6 个分类：餐厅🍜、购物🛍️、交通🚇、紧急🆘、住宿🏨、问候👋
  - 每个分类 8-15 句预置短语
  - 点击短语 → 使用并关闭 Modal

#### 9️⃣ 历史记录按钮（顶部时钟图标）
- **位置**: 卡片右上角
- **功能**: 查看最近翻译历史
- **Modal 内容**:
  - 显示最近 20 条翻译记录
  - 点击历史记录 → 重新显示结果
  - 支持删除单条 / 清空全部

---

## 📁 文件结构

### 新增文件列表

```
src/
├── components/
│   └── TranslationCard/
│       ├── TranslationCard.tsx           # 主组件（已存在，需重构）
│       ├── QuickPhrasesModal.tsx         # 快捷短语弹窗 [NEW]
│       ├── HistoryModal.tsx              # 历史记录弹窗 [NEW]
│       └── VoiceInputIndicator.tsx       # 语音输入动画组件 [NEW]
│
├── services/
│   ├── translationService.ts             # 翻译服务 [NEW]
│   ├── speechService.ts                  # 语音识别服务 [NEW]
│   ├── ocrService.ts                     # OCR 图片识别服务 [NEW]
│   └── ttsService.ts                     # 语音合成服务 [NEW]
│
├── hooks/
│   ├── useTranslation.ts                 # 翻译 Hook [NEW]
│   ├── useSpeechRecognition.ts           # 语音识别 Hook [NEW]
│   └── useLocalStorage.ts                # 本地存储 Hook（已存在）
│
├── data/
│   └── phraseLibrary.ts                  # 离线短语库数据 [NEW]
│
├── types/
│   └── translation.ts                    # 翻译相关类型定义 [NEW]
│
└── utils/
    ├── googleTranslate.ts                # Google Translate API 封装 [NEW]
    └── textMatcher.ts                    # 文本匹配工具 [NEW]
```

---

## 🚀 分阶段实现计划

### Phase 1: 基础翻译功能（核心优先）

**目标**: 实现文本输入和翻译的核心功能

**任务清单**:
1. ✅ 创建 `src/types/translation.ts` - 定义所有翻译相关类型
2. ✅ 创建 `src/data/phraseLibrary.ts` - 50+ 常用短语数据
3. ✅ 创建 `src/utils/googleTranslate.ts` - Google API 封装
4. ✅ 创建 `src/utils/textMatcher.ts` - 模糊匹配工具
5. ✅ 创建 `src/services/translationService.ts` - 翻译服务（离线 + API）
6. ✅ 创建 `src/hooks/useTranslation.ts` - 翻译逻辑 Hook
7. ✅ 重构 `src/components/TranslationCard.tsx`:
   - 添加文本输入框（替换静态展示）
   - 添加语言切换功能（复用交换按钮动画）
   - 连接 useTranslation Hook
   - 显示翻译结果 + 播放 + 复制按钮

**验收标准**:
- [ ] 输入中文 → 显示韩语翻译 + 罗马音
- [ ] 输入韩语 → 显示中文翻译
- [ ] 点击交换按钮 → 语言互换
- [ ] 点击播放按钮 → 朗读翻译结果
- [ ] 点击复制按钮 → 复制成功 + Toast 提示

---

### Phase 2: 语音输入功能

**目标**: 实现语音识别输入

**任务清单**:
1. ✅ 创建 `src/services/speechService.ts` - Web Speech API 封装
2. ✅ 创建 `src/hooks/useSpeechRecognition.ts` - 语音识别 Hook
3. ✅ 创建 `src/components/TranslationCard/VoiceInputIndicator.tsx` - 录音动画
4. ✅ 在 TranslationCard 中集成麦克风按钮:
   - 点击启动录音
   - 显示录音动画（声波/圆圈脉冲）
   - 实时显示识别文字
   - 自动停止并翻译

**验收标准**:
- [ ] 点击麦克风 → 开始录音
- [ ] 说话 → 实时显示识别文字
- [ ] 停止说话 → 自动翻译结果
- [ ] 浏览器不支持 → 显示友好提示
- [ ] 权限被拒绝 → 引导用户设置

---

### Phase 3: 快捷短语与历史

**目标**: 实现快捷短语弹窗和历史记录功能

**任务清单**:
1. ✅ 创建 `src/components/TranslationCard/QuickPhrasesModal.tsx`:
   - 6 个分类标签（横向滚动）
   - 每个分类显示 8-15 句短语
   - 点击短语 → 填入输入框并翻译
   - 长按短语 → 添加到收藏

2. ✅ 创建 `src/components/TranslationCard/HistoryModal.tsx`:
   - 显示最近 20 条翻译记录
   - 每条显示: 源文本 + 翻译结果 + 时间
   - 点击记录 → 重新显示结果
   - 滑动删除 / 清空全部按钮

3. ✅ 实现 LocalStorage 存储:
   - 收藏短语
   - 翻译历史

**验收标准**:
- [ ] 点击 "View All" → 打开快捷短语弹窗
- [ ] 点击分类 → 切换短语列表
- [ ] 点击短语 → 使用并翻译
- [ ] 长按短语 → 添加到收藏
- [ ] 点击时钟图标 → 打开历史记录
- [ ] 刷新页面 → 历史和收藏保留

---

### Phase 4: OCR 图片识别

**目标**: 实现图片文字识别功能

**任务清单**:
1. ✅ 安装依赖: `npm install tesseract.js`
2. ✅ 创建 `src/services/ocrService.ts`:
   - 初始化 Tesseract.js
   - 支持中韩语言识别
   - 显示识别进度

3. ✅ 在 TranslationCard 中集成 Scan 按钮:
   - 点击打开文件选择器（accept="image/*"）
   - 选择图片 → 显示进度条
   - 识别完成 → 提取文字并翻译
   - 错误处理 → 提示重试

**验收标准**:
- [ ] 点击 Scan → 选择图片
- [ ] 选择图片 → 显示识别进度
- [ ] 识别成功 → 自动翻译文字
- [ ] 识别失败 → 显示错误提示
- [ ] 支持中韩文字识别

---

### Phase 5: 语音播放与复制

**目标**: 完善结果区域的交互功能

**任务清单**:
1. ✅ 创建 `src/services/ttsService.ts` - Web Speech Synthesis 封装
2. ✅ 在 TranslationCard 结果区实现:
   - 播放按钮点击 → 朗读翻译结果
   - 播放中 → 图标变为暂停
   - 支持调节语速（0.5x - 2x）
   - 复制按钮点击 → 复制到剪贴板
   - Toast 提示系统

**验收标准**:
- [ ] 点击播放 → 朗读韩语/中文
- [ ] 发音自然流畅
- [ ] 点击复制 → 成功提示
- [ ] Toast 美观且不遮挡内容

---

### Phase 6: 优化与完善

**目标**: 优化性能、完善错误处理、提升用户体验

**任务清单**:
1. ✅ 性能优化:
   - 文本输入防抖（debounce 500ms）
   - 翻译结果缓存（LocalStorage）
   - 离线短语索引优化

2. ✅ 错误处理完善:
   - 网络错误 → 提示使用离线短语
   - API 配额超限 → 降级到离线模式
   - 输入验证（空、超长）

3. ✅ 用户体验优化:
   - 加载状态优化（Skeleton/Spinner）
   - 空状态提示
   - 引导提示（首次使用）

4. ✅ 测试与修复:
   - 测试所有按键功能
   - 测试边界情况
   - 修复发现的 bug

**验收标准**:
- [ ] 所有功能正常运行
- [ ] 无明显性能问题
- [ ] 错误处理友好
- [ ] 移动端适配良好

---

## 🔧 技术依赖

### 新增依赖
```json
{
  "dependencies": {
    "tesseract.js": "^5.0.0"
  }
}
```

### 环境变量
```env
# .env.local
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

### 可复用组件（已存在）
- **交换按钮动画**: `src/components/CurrencyConverterCard.tsx:55-68`
- **Neumorphism 样式**: `shadow-soft-out-sm`, `shadow-soft-out-lg`, `shadow-soft-in`, `shadow-glow-primary`

---

## 📦 离线短语库分类

### 完整分类列表

```typescript
export const PHRASE_CATEGORIES = {
  restaurant: {
    icon: '🍜',
    name: '餐厅',
    phrases: 15,
    examples: [
      '请问这个多少钱？',
      '我要点这个',
      '太辣了',
      '有素食吗？',
      '请给我菜单',
      '水，谢谢',
      '结账',
      '好吃！',
      '有推荐吗？',
      '还要点别的吗？',
      '这里有人坐吗？',
      '我预订了位置',
      '可以打包吗？',
      '我不吃...',
      '太咸了'
    ]
  },
  shopping: {
    icon: '🛍️',
    name: '购物',
    phrases: 12,
    examples: [
      '可以试穿吗？',
      '有折扣吗？',
      '我要买这个',
      '这个颜色有别的吗？',
      '有更大的吗？',
      '可以刷卡吗？',
      '能退款吗？',
      '有发票吗？',
      '多少钱？',
      '太贵了',
      '可以便宜点吗？',
      '我要看看别的'
    ]
  },
  transportation: {
    icon: '🚇',
    name: '交通',
    phrases: 10,
    examples: [
      '请问地铁站在哪？',
      '我要去...',
      '这是几号线？',
      '到...需要多久？',
      '在哪换乘？',
      '这是往...方向的车吗？',
      '请停车',
      '下一站是哪里？',
      '去机场怎么走？',
      '有地图吗？'
    ]
  },
  emergency: {
    icon: '🆘',
    name: '紧急',
    phrases: 8,
    examples: [
      '救命！',
      '请叫警察',
      '我迷路了',
      '我丢钱包了',
      '去医院',
      '我受伤了',
      '请帮我',
      '可以说中文吗？'
    ]
  },
  accommodation: {
    icon: '🏨',
    name: '住宿',
    phrases: 10,
    examples: [
      '我预订了房间',
      '几点早餐？',
      '有WiFi吗？',
      '几点退房？',
      '可以延迟退房吗？',
      '有毛巾吗？',
      '空调坏了',
      '房间很吵',
      '能换房间吗？',
      '有洗衣服务吗？'
    ]
  },
  greeting: {
    icon: '👋',
    name: '问候',
    phrases: 10,
    examples: [
      '你好',
      '谢谢',
      '对不起',
      '没关系',
      '再见',
      '请问',
      '可以吗？',
      '当然',
      '真的吗？',
      '不太明白'
    ]
  }
};
```

---

## ✅ 验收标准总结

### 核心功能
- [x] 文本输入翻译（中韩互译）
- [x] 语音识别输入
- [x] 图片 OCR 识别
- [x] 快捷短语系统（分类 + 收藏）
- [x] 翻译历史记录
- [x] 语音播放翻译结果
- [x] 复制翻译结果

### 用户体验
- [x] 所有按钮有明确的视觉反馈
- [x] 加载状态清晰可见
- [x] 错误提示友好且有用
- [x] 性能流畅（离线 < 50ms，API < 2s）
- [x] 移动端适配良好

### 技术质量
- [x] TypeScript 类型安全
- [x] 代码结构清晰易维护
- [x] 组件高度复用
- [x] 错误处理完善
- [x] 无明显 bug

---

## 📝 实现注意事项

### 开发原则
1. **离线优先**: 优先使用离线短语库，减少 API 调用
2. **渐进增强**: 先实现核心功能，再添加高级特性
3. **用户体验**: 每个操作都有明确的视觉反馈
4. **性能优化**: 防抖、缓存、懒加载
5. **错误处理**: 优雅降级，友好提示

### 代码规范
- 使用 TypeScript 严格模式
- 组件使用函数式 + Hooks
- 样式使用 Tailwind CSS
- 动画使用 Framer Motion
- 遵循项目现有代码风格

### 测试要点
- 测试所有按键功能
- 测试网络错误场景
- 测试边界情况（空输入、超长输入）
- 测试移动端适配
- 测试浏览器兼容性

---

## 🎯 下一步行动

执行此实现计划时，使用 `superpowers:subagent-driven-development` 技能：
1. 为每个 Phase 创建独立的 subagent
2. 每个 subagent 完成一个 Phase 的所有任务
3. Phase 之间进行代码审查（code-reviewer）
4. 完成后提交 git commit

**开始命令**: 执行 Phase 1 任务清单

---

**文档版本**: 1.0
**最后更新**: 2026-02-05
