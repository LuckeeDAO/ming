/**
 * 出生日期输入对话框
 * 
 * 支持公历和农历输入，转换为四柱八字
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Alert,
} from '@mui/material';
import { convertBirthToFourPillars } from '../../services/energy/fourPillarsConverter';
import type { FourPillars } from '../../types/energy';

interface BirthDateInputDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (fourPillars: FourPillars, birthDate: string, birthTime: string) => void;
}

const BirthDateInputDialog: React.FC<BirthDateInputDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('12:00');
  const [error, setError] = useState<string>('');

  const handleConvert = () => {
    setError('');
    
    if (!date) {
      setError('请选择出生日期');
      return;
    }

    try {
      const [yearStr, monthStr, dayStr] = date.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr);
      const day = Number(dayStr);
      const [hourStr] = time.split(':');
      const hour = Number(hourStr);

      if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day) ||
        !Number.isFinite(hour)
      ) {
        throw new Error('日期或时间格式无效');
      }

      // 注意：当前只支持公历转换，农历需要额外处理
      if (calendarType === 'lunar') {
        setError('农历转换功能开发中，请使用公历日期');
        return;
      }

      const fourPillars = convertBirthToFourPillars(year, month, day, hour);
      onConfirm(fourPillars, date, time);
      onClose();
      
      // 重置表单
      setDate('');
      setTime('12:00');
      setError('');
    } catch (e) {
      console.error('转换失败:', e);
      setError(
        e instanceof Error ? e.message : '转换失败，请检查输入'
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>输入出生日期</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">日历类型</FormLabel>
          <RadioGroup
            row
            value={calendarType}
            onChange={(e) => setCalendarType(e.target.value as 'solar' | 'lunar')}
          >
            <FormControlLabel value="solar" control={<Radio />} label="公历" />
            <FormControlLabel value="lunar" control={<Radio />} label="农历" />
          </RadioGroup>
        </FormControl>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={`出生日期（${calendarType === 'solar' ? '公历' : '农历'}）`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="出生时间（24小时制）"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {calendarType === 'lunar' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            农历转换功能开发中，请使用公历日期或直接输入四柱八字。
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          onClick={handleConvert}
          variant="contained"
          disabled={calendarType === 'lunar'}
        >
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BirthDateInputDialog;
