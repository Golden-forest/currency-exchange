# SettingsModal 组件测试指南

## 手动测试步骤

### 1. 准备测试环境

在 TripLedgerCard.tsx 中临时添加测试代码：

```tsx
import { SettingsModal } from '@/components/TripLedgerCard/SettingsModal';

export function TripLedgerCard() {
  const [showSettings, setShowSettings] = useState(true); // 自动显示
  const [settings, setSettings] = useState<TripSettings | null>(null);

  return (
    <div>
      {/* 原有内容 */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => {
            console.log('保存的设置:', newSettings);
            setSettings(newSettings);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
```

### 2. 测试场景

#### 场景 A: 首次使用（settings = null）
**操作步骤：**
1. 打开应用，模态框自动弹出
2. 所有字段为空
3. 汇率显示"汇率加载中..."或默认值

**预期结果：**
- ✅ 模态框显示
- ✅ 所有输入框为空
- ✅ 保存按钮可点击

#### 场景 B: 表单验证 - 旅行者不足
**操作步骤：**
1. 输入1个旅行者姓名："张三"
2. 输入预算：2000000
3. 输入地点：Seoul
4. 点击"保存设置"

**预期结果：**
- ✅ 显示错误："旅行者至少需要2人"
- ✅ 输入框边框变红
- ✅ 模态框不关闭

#### 场景 C: 表单验证 - 预算无效
**操作步骤：**
1. 输入旅行者："张三, 李四"
2. 输入预算：0 或 -100
3. 输入地点：Seoul
4. 点击"保存设置"

**预期结果：**
- ✅ 显示错误："预算必须大于0"
- ✅ 预算输入框边框变红

#### 场景 D: 表单验证 - 地点缺失
**操作步骤：**
1. 输入旅行者："张三, 李四"
2. 输入预算：2000000
3. 地点留空
4. 点击"保存设置"

**预期结果：**
- ✅ 显示错误："请输入旅行地点"
- ✅ 地点输入框边框变红

#### 场景 E: 成功保存
**操作步骤：**
1. 输入旅行者："张三, 李四, 王五"
2. 输入预算：2000000
3. 输入地点：Seoul, South Korea
4. 点击"保存设置"

**预期结果：**
- ✅ 无错误提示
- ✅ 模态框关闭
- ✅ console.log 输出保存的设置
- ✅ 设置包含所有正确字段

**检查保存的数据结构：**
```typescript
{
  travelers: ["张三", "李四", "王五"],
  totalBudget: 2000000,
  currentRate: 0.0053, // 或实际汇率
  location: "Seoul, South Korea"
}
```

#### 场景 F: 编辑现有设置
**操作步骤：**
1. 首次保存后，重新打开模态框
2. 检查表单是否预填充了之前的值
3. 修改旅行者为："张三, 李四, 王五, 赵六"
4. 点击"保存设置"

**预期结果：**
- ✅ 表单预填充正确
- ✅ 修改后成功保存
- ✅ travelers 数组包含4个元素

#### 场景 G: 取消操作
**操作步骤：**
1. 打开模态框
2. 填写部分表单
3. 点击"取消"按钮

**预期结果：**
- ✅ 模态框关闭
- ✅ 表单数据未保存
- ✅ settings 保持不变

#### 场景 H: 点击背景关闭
**操作步骤：**
1. 打开模态框
2. 点击模态框外的半透明背景

**预期结果：**
- ✅ 模态框关闭
- ✅ 表单数据未保存

#### 场景 I: 实时反馈
**操作步骤：**
1. 输入旅行者："张三, 李四, 王五"
2. 观察"已添加 X 位旅行者"提示

**预期结果：**
- ✅ 实时显示："已添加 3 位旅行者"
- ✅ 输入时数字动态更新

#### 场景 J: 人民币转换
**操作步骤：**
1. 输入预算：2000000
2. 观察人民币提示

**预期结果：**
- ✅ 显示："约 ¥ 1060.00 CNY" (根据汇率)
- ✅ 数值随预算输入实时更新

### 3. UI 测试

#### 样式检查
- [ ] 模态框居中显示
- [ ] 圆角为 3rem
- [ ] 输入框有内阴影效果 (inset shadow)
- [ ] 错误时输入框边框变红 (#FF6B81)
- [ ] 正常时输入框边框为紫色 (#8B5CF6)
- [ ] 保存按钮是渐变色 (#FF6B81 to #FF9FF3)
- [ ] 背景遮罩半透明且模糊

#### 动画检查
- [ ] 打开时有淡入和缩放动画
- [ ] 关闭时有淡出和缩放动画
- [ ] 动画流畅，无卡顿
- [ ] 动画时长约 200ms

#### 响应式检查
- [ ] 移动端正常显示
- [ ] 桌面端居中且最大宽度适中
- [ ] 输入框不会溢出屏幕

### 4. 边界情况测试

#### 特殊字符
**操作步骤：**
1. 输入旅行者："张三,, 李四,, 王五" (多余逗号)
2. 输入旅行者：" 张三 , 李四 , 王五 " (多余空格)

**预期结果：**
- ✅ 自动去除空姓名
- ✅ 自动去除前后空格
- ✅ 正确解析为 ["张三", "李四", "王五"]

#### 超长输入
**操作步骤：**
1. 输入超长旅行者姓名（超过20个字符）
2. 输入超大预算（超过10亿）

**预期结果：**
- ✅ 不会溢出或破坏布局
- ✅ 数值计算正确

#### 汇率未加载
**操作步骤：**
1. 在 exchangeService 未初始化时打开模态框

**预期结果：**
- ✅ 显示"汇率加载中..."
- ✅ 仍可以保存设置（使用默认汇率）

### 5. 性能测试

#### 渲染性能
- [ ] 打开/关闭模态框无延迟
- [ ] 输入时无卡顿
- [ ] 验证错误即时显示

#### 内存泄漏
- [ ] 多次打开/关闭后内存正常
- [ ] 组件卸载后无事件监听器残留

### 6. 可访问性测试

- [ ] 所有输入框有 label
- [ ] 错误信息与输入框关联
- [ ] 键盘可以操作（Tab, Enter, Esc）
- [ ] 屏幕阅读器友好

## 自动化测试建议

### 使用 React Testing Library

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsModal } from '@/components/TripLedgerCard/SettingsModal';

describe('SettingsModal', () => {
  it('should show validation error for less than 2 travelers', async () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <SettingsModal
        settings={null}
        onSave={onSave}
        onClose={onClose}
      />
    );

    // 输入旅行者
    const input = screen.getByPlaceholderText(/用逗号分隔/);
    fireEvent.change(input, { target: { value: '张三' } });

    // 点击保存
    const saveButton = screen.getByText('保存设置');
    fireEvent.click(saveButton);

    // 验证错误显示
    await waitFor(() => {
      expect(screen.getByText('旅行者至少需要2人')).toBeInTheDocument();
    });

    // 验证未调用 onSave
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should save settings with valid data', async () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <SettingsModal
        settings={null}
        onSave={onSave}
        onClose={onClose}
      />
    );

    // 填写表单
    fireEvent.change(screen.getByPlaceholderText(/用逗号分隔/), {
      target: { value: '张三, 李四, 王五' }
    });
    fireEvent.change(screen.getByPlaceholderText(/例如: 2000000/), {
      target: { value: '2000000' }
    });
    fireEvent.change(screen.getByPlaceholderText(/例如: Seoul/), {
      target: { value: 'Seoul, South Korea' }
    });

    // 点击保存
    fireEvent.click(screen.getByText('保存设置'));

    // 验证保存调用
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        travelers: ['张三', '李四', '王五'],
        totalBudget: 2000000,
        currentRate: expect.any(Number),
        location: 'Seoul, South Korea',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
```

## 测试检查清单

### 功能测试
- [ ] 旅行者验证（<2人）
- [ ] 预算验证（<=0）
- [ ] 地点验证（空值）
- [ ] 成功保存
- [ ] 取消操作
- [ ] 编辑模式
- [ ] 背景点击关闭

### UI 测试
- [ ] Neumorphism 样式
- [ ] 错误状态样式
- [ ] 动画效果
- [ ] 响应式布局

### 边界测试
- [ ] 特殊字符处理
- [ ] 超长输入
- [ ] 汇率未加载

### 集成测试
- [ ] 与 localStorage 集成
- [ ] 与 exchangeService 集成
- [ ] 与主组件集成

## 测试报告模板

```markdown
## SettingsModal 测试报告

测试日期：2026-02-05
测试人员：[你的名字]

### 测试结果汇总
- 通过测试：X / Y
- 失败测试：X / Y
- 阻塞问题：X

### 详细结果

#### 场景 A: 首次使用
- 状态：✅ 通过 / ❌ 失败
- 备注：...

#### 场景 B: 表单验证
- 状态：✅ 通过 / ❌ 失败
- 备注：...

...

### 发现的问题
1. [问题描述]
   - 严重性：高/中/低
   - 复现步骤：...
   - 期望行为：...

### 改进建议
1. [建议内容]
```

## 下一步

测试通过后，可以继续实现：
1. Phase 4: AddTransactionModal.tsx
2. Phase 5: 交易列表更新
3. Phase 6: SettlementModal.tsx
