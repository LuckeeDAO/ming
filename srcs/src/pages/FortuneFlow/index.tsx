/**
 * 大运 / 流年 / 流月 / 流时 流转查看工具
 *
 * 功能：
 * - 基于出生日期，生成一段时间内的大运、流年、流月、流时干支序列
 * - 侧重展示「时间维度的流量与节奏」，不直接做命理解读
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { buildFortuneCascade } from '../../services/energy/fortuneCascadeService';

const FortuneFlow: React.FC = () => {
  const today = new Date();
  const [birthDate, setBirthDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`,
  );
  const [fromYear, setFromYear] = useState<number>(today.getFullYear());
  const [yearsSpan, setYearsSpan] = useState<number>(10);
  const [error, setError] = useState<string>('');

  let result: ReturnType<typeof buildFortuneCascade> | null = null;
  try {
    result = buildFortuneCascade(birthDate, {
      fromYear,
      yearsSpan,
      includeLiuShi: true,
    });
  } catch (e) {
    result = null;
    if (!error) {
      setError(e instanceof Error ? e.message : '无法计算大运 / 流年，请检查出生日期');
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          大运 / 流年流转
        </Typography>
        <Typography variant="body1" color="text.secondary">
          基于出生日期，查看一段时间内的大运、流年、流月、流时干支序列，用于理解时间维度的节奏与流量。
          本工具只给出干支流转结果，不直接输出命理吉凶判断。
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            输入信息
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="出生日期（公历）"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setError('');
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="流年起始年份"
                type="number"
                value={fromYear}
                onChange={(e) => {
                  setFromYear(Number(e.target.value) || today.getFullYear());
                  setError('');
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="流年跨度（年数）"
                type="number"
                value={yearsSpan}
                onChange={(e) => {
                  setYearsSpan(Number(e.target.value) || 10);
                  setError('');
                }}
              />
            </Grid>
          </Grid>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      {result && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  流年（{result.active.year} 年附近）
                </Typography>
                <List dense>
                  {result.liuNian.map((y) => (
                    <ListItem key={y.year}>
                      <ListItemText
                        primary={`${y.year} 年`}
                        secondary={`年柱：${y.ganZhi}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  流月（{result.active.year} 年）
                </Typography>
                <List dense>
                  {result.liuYue.map((m) => (
                    <ListItem key={`${m.year}-${m.month}`}>
                      <ListItemText
                        primary={`${m.year}-${String(m.month).padStart(2, '0')} 月`}
                        secondary={`月柱：${m.ganZhi}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  流时（示例日 {result.active.month} 月 {result.active.day} 日）
                </Typography>
                {result.liuShi ? (
                  <List dense>
                    {result.liuShi.map((s) => (
                      <ListItem key={s.dateTime}>
                        <ListItemText
                          primary={s.dateTime.replace('T', ' ').slice(0, 16)}
                          secondary={`时柱：${s.ganZhi}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    当前未生成流时序列。
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default FortuneFlow;

