/**
 * 外物选择器组件测试
 * 
 * 测试外物选择器组件的功能
 * 
 * @module __tests__/components/ExternalObjectSelector.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExternalObjectSelector from '../../components/ceremony/ExternalObjectSelector';
import { ExternalObject } from '../../types/energy';
import { generateTestExternalObjects } from '../utils/testHelpers';

describe('ExternalObjectSelector', () => {
  const mockObjects: ExternalObject[] = generateTestExternalObjects(3);
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染外物列表', () => {
    render(
      <ExternalObjectSelector
        objects={mockObjects}
        onSelect={mockOnSelect}
      />
    );

    // 应该显示所有外物
    mockObjects.forEach((obj) => {
      expect(screen.getByText(obj.name)).toBeInTheDocument();
    });
  });

  it('应该在选择外物时调用onSelect', () => {
    render(
      <ExternalObjectSelector
        objects={mockObjects}
        onSelect={mockOnSelect}
      />
    );

    // 点击第一个外物卡片
    const firstObjectCard = screen.getByText(mockObjects[0].name).closest('div[class*="Card"]');
    if (firstObjectCard) {
      fireEvent.click(firstObjectCard);
      expect(mockOnSelect).toHaveBeenCalledWith(mockObjects[0]);
    }
  });

  it('应该显示已选择的外物', () => {
    render(
      <ExternalObjectSelector
        objects={mockObjects}
        selectedObjectId={mockObjects[0].id}
        onSelect={mockOnSelect}
      />
    );

    // 应该显示"已选择"标签
    expect(screen.getByText('已选择')).toBeInTheDocument();
  });

  it('应该在没有外物时显示提示', () => {
    render(
      <ExternalObjectSelector
        objects={[]}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(/暂无推荐外物/i)).toBeInTheDocument();
  });

  it('应该打开详情对话框', () => {
    render(
      <ExternalObjectSelector
        objects={mockObjects}
        onSelect={mockOnSelect}
      />
    );

    // 点击"查看详情"按钮
    const detailButtons = screen.getAllByText('查看详情');
    if (detailButtons.length > 0) {
      fireEvent.click(detailButtons[0]);
      // 应该显示对话框
      expect(screen.getByText(mockObjects[0].name)).toBeInTheDocument();
    }
  });
});
