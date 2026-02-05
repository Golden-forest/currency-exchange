# 翻译功能配置指南

本文档详细说明如何配置和运行翻译功能。

## 📋 配置清单

### 必需配置（翻译功能核心）

1. **DeepSeek API 密钥** - 用于复杂句子的在线翻译
2. **HTTPS 环境** - Web Speech API 和 OCR 功能需要安全上下文

### 可选配置（增强功能）

3. **Korean Romanizer 库** - 用于韩文罗马音转换（已集成）

---

## 1️⃣ DeepSeek API 配置

### 为什么需要配置？

翻译功能使用**混合翻译策略**：
- **80% 场景**：使用离线短语库（无需 API，快速）
- **20% 场景**：复杂句子需要调用 DeepSeek API

如果不配置 API 密钥：
- ✅ 离线短语功能仍然可用（175 句常用语）
- ❌ 复杂句子翻译将失败
- ⚠️ 会显示配置提示

### 获取 API 密钥步骤

#### 步骤 1：访问 DeepSeek 开放平台

```
https://platform.deepseek.com/
```

#### 步骤 2：注册/登录账号

- 点击右上角"登录"或"注册"
- 使用手机号或邮箱注册
- 完成邮箱验证

#### 步骤 3：创建 API 密钥

1. 登录后进入控制台
2. 点击左侧菜单"API Keys"
3. 点击"创建新密钥"按钮
4. 输入密钥名称（如"Currency Exchange"）
5. 点击"创建"
6. **重要**: 立即复制密钥（格式: `sk-xxxxx`）

#### 步骤 4：配置到项目

1. **创建环境变量文件**
   ```bash
   # 在项目根目录执行
   cp .env.local.example .env.local
   ```

2. **编辑 .env.local 文件**
   ```bash
   # 将 your_api_key_here 替换为你的实际 API 密钥
   NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-你的实际API密钥
   ```

3. **重启开发服务器**
   ```bash
   # 停止当前服务器（Ctrl+C）
   # 重新启动
   npm run dev
   ```

### 费用说明

DeepSeek API 定价：
- **输入**: ¥1/百万 tokens
- **输出**: ¥2/百万 tokens

**预估使用量**：
- 离线短语库覆盖 80% 场景，不需要调用 API
- 假设每天 100 次在线翻译，每次 20 tokens
- 每月约 60,000 tokens（输入 40,000 + 输出 20,000）
- **每月费用**: ¥0.03（约 ¥0.36/年）

**结论**: 成本极低，几乎可以忽略不计。

---

## 2️⃣ HTTPS 环境配置

### 为什么需要 HTTPS？

以下功能**必须**在 HTTPS 或 localhost 下运行：
- ✅ 语音识别（Web Speech API）
- ✅ OCR 图片识别（Tesseract.js 下载语言包）

### 本地开发（无需配置）

本地开发环境自动满足要求：
- ✅ `http://localhost:3000` - 支持
- ✅ `http://localhost:3001` - 支持
- ✅ `http://127.0.0.1:3000` - 支持

### 生产部署

**必须使用 HTTPS**，否则以下功能不可用：
- 语音输入
- OCR 图片识别

**推荐部署方案**：

#### 方案 1：Vercel（推荐，免费）
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel

# 3. 在 Vercel 控制台配置环境变量
# Settings → Environment Variables
# NEXT_PUBLIC_DEEPSEEK_API_KEY
```

#### 方案 2：Netlify（免费）
```bash
# 1. 安装 Netlify CLI
npm i -g netlify-cli

# 2. 构建
npm run build

# 3. 部署
netlify deploy --prod

# 4. 在 Netlify 控制台配置环境变量
# Site settings → Environment variables
```

#### 方案 3：自建服务器
- 使用 Nginx + Let's Encrypt（免费 SSL 证书）
- 参考：https://letsencrypt.org/

---

## 3️⃣ Korean Romanizer 配置（已完成）

### 当前状态

韩文罗马音功能已集成到项目中：
- ✅ 已安装 `korean-romanizer` 库
- ✅ 自动为韩文翻译结果生成罗马音
- ✅ 无需额外配置

### 功能说明

翻译韩文时，系统会自动：
1. 调用 DeepSeek API 翻译文本
2. 使用 `korean-romanizer` 库生成罗马音
3. 在界面显示罗马音（例如：안녕하세요 [annyeonghaseyo]）

### 示例

```
输入: 你好
翻译: 안녕하세요
罗马音: annyeonghaseyo
```

---

## ✅ 验证配置

### 1. 检查 API 密钥配置

启动应用后，打开浏览器控制台：
- ✅ 如果配置正确：无警告信息
- ❌ 如果未配置：会看到警告

```javascript
// 正确配置：无警告

// 未配置：显示警告
// 警告: DeepSeek API 密钥未配置
// 警告: 请创建 .env.local 文件并添加 NEXT_PUBLIC_DEEPSEEK_API_KEY
```

### 2. 测试翻译功能

1. **测试离线短语**（无需 API）
   - 输入："你好"
   - 应该立即显示："안녕하세요"
   - 应该显示罗马音："annyeonghaseyo"

2. **测试在线翻译**（需要 API）
   - 输入："这个商品的详细信息是什么？"
   - 应该在 1-2 秒后显示翻译结果
   - 如果 API 未配置，会显示错误提示

3. **测试自动语言检测**（新功能）
   - 输入中文："你好" → 自动翻译成韩文
   - 输入韩文："안녕하세요" → 自动翻译成中文
   - 不需要手动切换语言方向

### 3. 测试语音输入

1. **检查浏览器支持**
   - 点击麦克风按钮
   - 如果浏览器不支持，会显示提示

2. **测试语音识别**
   - 点击麦克风按钮
   - 允许麦克风权限
   - 说话（中文或韩文）
   - 应该实时显示识别文字
   - 停止说话后自动翻译

### 4. 测试 OCR 图片识别

1. **点击 Scan 按钮**
2. **选择图片**（包含中文或韩文文字的图片）
3. **查看进度条**
   - 应该显示识别进度（0-100%）
   - 第一次运行会下载语言包（需要网络）
4. **自动翻译**
   - 识别完成后应该自动翻译文字

---

## 🐛 常见问题

### Q1: DeepSeek API 密钥无效？

**症状**: 翻译失败，提示"API 密钥无效或无权限访问"

**解决方案**:
1. 检查 `.env.local` 文件中的 API 密钥格式
2. 确认密钥以 `sk-` 开头
3. 登录 DeepSeek 平台检查密钥是否有效
4. 重启开发服务器

### Q2: 自动语言检测不准确？

**症状**: 输入中文但被识别为韩文

**解决方案**:
1. 检查输入文本是否包含韩文字符
2. 如果混合中韩文，会优先识别为韩文
3. 这是预期行为，可以手动修正

### Q3: 语音识别不工作？

**可能原因**:
1. 浏览器不支持（使用 Chrome、Edge 或 Safari）
2. 不是 HTTPS 或 localhost
3. 麦克风权限被拒绝

**解决方案**:
1. 检查浏览器控制台错误信息
2. 确认在 localhost 或 HTTPS 环境下
3. 检查浏览器麦克风权限设置

### Q4: OCR 识别失败？

**可能原因**:
1. 图片格式不支持（仅支持 JPEG、PNG、BMP、WebP）
2. 图片太大（限制 10MB）
3. 网络问题（无法下载语言包）

**解决方案**:
1. 转换图片格式
2. 压缩图片大小
3. 检查网络连接

### Q5: 开发环境变量不生效？

**解决方案**:
1. 确认文件名是 `.env.local`（不是 `.env.local.example`）
2. 确认文件在项目根目录
3. 重启开发服务器（Ctrl+C 然后重新运行 `npm run dev`）

### Q6: 翻译速度慢？

**症状**: 在线翻译需要 3 秒以上

**可能原因**:
1. 网络连接不稳定
2. DeepSeek API 服务器负载高
3. 超时重试机制触发

**解决方案**:
1. 检查网络连接
2. 等待 API 服务恢复
3. 依赖离线短语库（80% 场景）

---

## 📚 相关文档

- [DeepSeek API 官方文档](https://api-docs.deepseek.com/)
- [Tesseract.js 文档](https://tesseract.projectnaptha.com/)
- [Web Speech API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [korean-romanizer npm 包](https://www.npmjs.com/package/korean-romanizer)

---

## 🎉 快速开始

```bash
# 1. 复制环境变量文件
cp .env.local.example .env.local

# 2. 编辑 .env.local，添加 DeepSeek API 密钥
# NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-你的实际API密钥

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:3001
```

配置完成后，翻译功能就可以正常使用了！🚀

**主要特性**:
- ✅ 自动语言检测（无需手动切换）
- ✅ 离线短语库（175 句常用语）
- ✅ 在线翻译（DeepSeek API）
- ✅ 韩文罗马音显示
- ✅ 语音识别输入
- ✅ 图片 OCR 识别
- ✅ 成本极低（约 ¥0.36/年）
