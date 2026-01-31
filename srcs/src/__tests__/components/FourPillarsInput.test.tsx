/**
 * 四柱八字输入组件测试
 * 
 * 测试四柱八字输入组件的功能
 * 
 * @module __tests__/components/FourPillarsInput.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FourPillarsInput from '../../components/energy/FourPillarsInput';
import energyReducer from '../../store/slices/energySlice';

// 创建测试用的Redux store
const createTestStore = () => {
  return configureStore({
    reducer: {
      energy: energyReducer,
    },
  });
};

describe('FourPillarsInput', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    vi.clearAllMocks();
  });

  it('应该渲染四柱八字输入表单', () => {
    render(
      <Provider store={store}>
        <FourPillarsInput />
      </Provider>
    );

    // 应该显示所有四个输入框
    expect(screen.getByLabelText(/年柱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/月柱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/日柱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/时柱/i)).toBeInTheDocument();
  });

  it('应该限制输入长度为2个字符', () => {
    render(
      <Provider store={store}>
        <FourPillarsInput />
      </Provider>
    );

    const yearInput = screen.getByLabelText(/年柱/i) as HTMLInputElement;
    fireEvent.change(yearInput, { target: { value: '甲乙丙' } });

    // 应该只保留前2个字符
    expect(yearInput.value.length).toBeLessThanOrEqual(2);
  });

  it('应该验证输入格式', async () => {
    render(
      <Provider store={store}>
        <FourPillarsInput />
      </Provider>
    );

    // 输入无效格式
    const yearInput = screen.getByLabelText(/年柱/i);
    fireEvent.change(yearInput, { target: { value: 'XX' } });

    // 点击分析按钮
    const analyzeButton = screen.getByText('开始分析');
    fireEvent.click(analyzeButton);

    // 应该显示错误信息
    await waitFor(() => {
      expect(screen.getByText(/格式不正确/i)).toBeInTheDocument();
    });
  });

  it('应该在输入有效四柱八字后可以分析', async () => {
    render(
      <Provider store={store}>
        <FourPillarsInput />
      </Provider>
    );

    // 输入有效的四柱八字
    fireEvent.change(screen.getByLabelText(/年柱/i), { target: { value: '甲子' } });
    fireEvent.change(screen.getByLabelText(/月柱/i), { target: { value: '乙丑' } });
    fireEvent.change(screen.getByLabelText(/日柱/i), { target: { value: '丙寅' } });
    fireEvent.change(screen.getByLabelText(/时柱/i), { target: { value: '丁卯' } });

    // 点击分析按钮
    const analyzeButton = screen.getByText('开始分析');
    fireEvent.click(analyzeButton);

    // 应该显示"分析中..."
    await waitFor(() => {
      expect(screen.getByText(/分析中/i)).toBeInTheDocument();
    });
  });
});
