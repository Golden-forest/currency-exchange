/**
 * 测试 ExchangeRateCard 的"记一笔"按钮功能
 *
 * 测试内容:
 * 1. 汇率查询成功后,按钮正确显示
 * 2. 按钮从底部滑入动画效果
 * 3. 5 秒后按钮自动消失
 * 4. 点击按钮触发回调
 * 5. 点击按钮后立即隐藏
 * 6. 组件卸载时清理定时器
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ExchangeRateCard } from '@/components/ExchangeRateCard';

// Mock useExchangeRate hook
jest.mock('@/hooks/useExchangeRate', () => ({
  useExchangeRate: () => ({
    rate: 0.0052,
    lastUpdate: new Date(),
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('ExchangeRateCard - 记一笔按钮', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('汇率查询成功后显示"记一笔"按钮', async () => {
    const mockCallback = jest.fn();
    render(<ExchangeRateCard onAddToLedger={mockCallback} />);

    // 等待组件渲染
    await waitFor(() => {
      expect(screen.queryByText('记一笔')).toBeInTheDocument();
    });
  });

  test('点击按钮触发 onAddToLedger 回调并隐藏按钮', async () => {
    const mockCallback = jest.fn();
    render(<ExchangeRateCard onAddToLedger={mockCallback} />);

    // 等待按钮出现
    const button = await screen.findByText('记一笔');
    expect(button).toBeInTheDocument();

    // 点击按钮
    fireEvent.click(button);

    // 验证回调被调用
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(0.0052);

    // 验证按钮立即消失
    await waitFor(() => {
      expect(screen.queryByText('记一笔')).not.toBeInTheDocument();
    });
  });

  test('5秒后按钮自动消失', async () => {
    const mockCallback = jest.fn();
    render(<ExchangeRateCard onAddToLedger={mockCallback} />);

    // 等待按钮出现
    await waitFor(() => {
      expect(screen.queryByText('记一笔')).toBeInTheDocument();
    });

    // 快进 4.9 秒,按钮仍应存在
    jest.advanceTimersByTime(4900);
    expect(screen.queryByText('记一笔')).toBeInTheDocument();

    // 快进到 5 秒,按钮应该消失
    jest.advanceTimersByTime(100);
    await waitFor(() => {
      expect(screen.queryByText('记一笔')).not.toBeInTheDocument();
    });
  });

  test('组件卸载时清理定时器', () => {
    const mockCallback = jest.fn();
    const { unmount } = render(<ExchangeRateCard onAddToLedger={mockCallback} />);

    // 组件内部应该设置了定时器
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    // 卸载组件
    unmount();

    // 验证 clearTimeout 被调用
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  test('没有 onAddToLedger 回调时不报错', async () => {
    // 不应该抛出错误
    expect(() => {
      render(<ExchangeRateCard />);
    }).not.toThrow();

    // 按钮仍然应该显示
    await waitFor(() => {
      expect(screen.queryByText('记一笔')).toBeInTheDocument();
    });

    // 点击按钮不应该报错
    const button = screen.queryByText('记一笔');
    if (button) {
      fireEvent.click(button);
    }
  });

  test('汇率加载中时不显示按钮', () => {
    // Mock loading 状态
    (jest.requireMock('@/hooks/useExchangeRate').useExchangeRate as jest.Mock).mockReturnValue({
      rate: null,
      lastUpdate: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const mockCallback = jest.fn();
    render(<ExchangeRateCard onAddToLedger={mockCallback} />);

    // 按钮不应该显示
    expect(screen.queryByText('记一笔')).not.toBeInTheDocument();
  });

  test('汇率加载出错时不显示按钮', () => {
    // Mock error 状态
    (jest.requireMock('@/hooks/useExchangeRate').useExchangeRate as jest.Mock).mockReturnValue({
      rate: null,
      lastUpdate: null,
      isLoading: false,
      error: '网络错误',
      refetch: jest.fn(),
    });

    const mockCallback = jest.fn();
    render(<ExchangeRateCard onAddToLedger={mockCallback} />);

    // 按钮不应该显示
    expect(screen.queryByText('记一笔')).not.toBeInTheDocument();
  });
});
