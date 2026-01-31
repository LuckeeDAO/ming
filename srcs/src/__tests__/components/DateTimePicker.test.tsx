/**
 * 日期时间选择器组件测试
 * 
 * 测试日期时间选择器组件的功能
 * 
 * @module __tests__/components/DateTimePicker.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DateTimePicker from '../../components/ceremony/DateTimePicker';

describe('DateTimePicker', () => {
  it('应该渲染日期时间选择器', () => {
    const onChange = vi.fn();
    render(<DateTimePicker value={null} onChange={onChange} />);
    
    expect(screen.getByLabelText(/选择日期和时间/i)).toBeInTheDocument();
  });

  it('应该在值变化时调用onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateTimePicker value={null} onChange={onChange} />
    );
    
    const input = container.querySelector('input[type="datetime-local"]');
    expect(input).toBeInTheDocument();
    
    if (input) {
      // 设置一个未来的日期时间
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateString = futureDate.toISOString().slice(0, 16);
      
      fireEvent.change(input, { target: { value: dateString } });
      
      // onChange应该被调用
      expect(onChange).toHaveBeenCalled();
    }
  });

  it('应该显示已选择的时间', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const isoString = futureDate.toISOString();
    
    render(
      <DateTimePicker value={isoString} onChange={vi.fn()} />
    );
    
    // 应该显示已选择的时间
    expect(screen.getByText(/已选择/i)).toBeInTheDocument();
  });

  it('应该显示错误信息', () => {
    render(
      <DateTimePicker
        value={null}
        onChange={vi.fn()}
        error="时间不能是过去"
      />
    );
    
    expect(screen.getByText('时间不能是过去')).toBeInTheDocument();
  });

  it('应该在禁用时禁用输入', () => {
    const { container } = render(
      <DateTimePicker value={null} onChange={vi.fn()} disabled />
    );
    
    const input = container.querySelector('input[type="datetime-local"]');
    expect(input).toBeDisabled();
  });
});
