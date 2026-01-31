/**
 * 日期时间选择器组件
 * 
 * 功能：
 * - 支持日期和时间选择
 * - 验证不能选择过去的时间
 * - 时区处理（使用本地时间）
 * - 格式化显示
 * 
 * 使用说明：
 * - 用于定时MINT功能的时间选择
 * - 自动验证时间不能早于当前时间
 * 
 * @module components/ceremony/DateTimePicker
 */

import React from 'react';
import {
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material';

/**
 * 日期时间选择器组件属性接口
 */
interface DateTimePickerProps {
  /**
   * 当前选中的日期时间（ISO格式字符串）
   */
  value: string | null;
  
  /**
   * 值变化回调函数
   * 
   * @param value - 新的日期时间值（ISO格式字符串或null）
   */
  onChange: (value: string | null) => void;
  
  /**
   * 标签文本
   */
  label?: string;
  
  /**
   * 是否禁用
   */
  disabled?: boolean;
  
  /**
   * 最小日期时间（ISO格式字符串，可选）
   */
  minDateTime?: string;
  
  /**
   * 错误提示文本
   */
  error?: string;
  
  /**
   * 帮助文本
   */
  helperText?: string;
}

/**
 * 日期时间选择器组件
 * 
 * @param props - 组件属性
 */
const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label = '选择日期和时间',
  disabled = false,
  minDateTime,
  error,
  helperText,
}) => {
  // 将ISO格式转换为本地日期时间字符串（用于input[type="datetime-local"]）
  const formatForInput = (isoString: string | null): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // 转换为本地时间格式：YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 将本地日期时间字符串转换为ISO格式
  const parseFromInput = (localString: string): string => {
    if (!localString) return '';
    const date = new Date(localString);
    return date.toISOString();
  };

  // 获取最小日期时间（默认为当前时间）
  const getMinDateTime = (): string => {
    if (minDateTime) {
      return formatForInput(minDateTime);
    }
    // 默认最小时间为当前时间
    return formatForInput(new Date().toISOString());
  };

  /**
   * 处理日期时间变化
   * 
   * @param event - 输入事件
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (!inputValue) {
      onChange(null);
      return;
    }

    const isoString = parseFromInput(inputValue);
    const selectedDate = new Date(isoString);
    const now = new Date();

    // 验证不能选择过去的时间
    if (selectedDate <= now) {
      // 这里不直接设置错误，而是由父组件处理
      // 但我们可以提供一个默认的最小时间
      return;
    }

    onChange(isoString);
  };

  return (
    <Box>
      <TextField
        fullWidth
        type="datetime-local"
        label={label}
        value={value ? formatForInput(value) : ''}
        onChange={handleChange}
        disabled={disabled}
        error={!!error}
        helperText={error || helperText || '请选择未来的日期和时间'}
        inputProps={{
          min: getMinDateTime(),
        }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      {value && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            已选择：{new Date(value).toLocaleString('zh-CN')}
          </Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default DateTimePicker;
