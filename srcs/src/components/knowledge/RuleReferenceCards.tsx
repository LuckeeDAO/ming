import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export const FiveElementsRuleTable: React.FC = () => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>五行</TableCell>
          <TableCell>相生对象</TableCell>
          <TableCell>相克对象</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow><TableCell>木</TableCell><TableCell>火</TableCell><TableCell>土</TableCell></TableRow>
        <TableRow><TableCell>火</TableCell><TableCell>土</TableCell><TableCell>金</TableCell></TableRow>
        <TableRow><TableCell>土</TableCell><TableCell>金</TableCell><TableCell>水</TableCell></TableRow>
        <TableRow><TableCell>金</TableCell><TableCell>水</TableCell><TableCell>木</TableCell></TableRow>
        <TableRow><TableCell>水</TableCell><TableCell>木</TableCell><TableCell>火</TableCell></TableRow>
      </TableBody>
    </Table>
  </TableContainer>
);

export const TenGodRuleTable: React.FC = () => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>关系</TableCell>
          <TableCell>阴阳同</TableCell>
          <TableCell>阴阳异</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow><TableCell>同我</TableCell><TableCell>比肩</TableCell><TableCell>劫财</TableCell></TableRow>
        <TableRow><TableCell>我生</TableCell><TableCell>食神</TableCell><TableCell>伤官</TableCell></TableRow>
        <TableRow><TableCell>我克</TableCell><TableCell>偏财</TableCell><TableCell>正财</TableCell></TableRow>
        <TableRow><TableCell>克我</TableCell><TableCell>七杀</TableCell><TableCell>正官</TableCell></TableRow>
        <TableRow><TableCell>生我</TableCell><TableCell>偏印</TableCell><TableCell>正印</TableCell></TableRow>
      </TableBody>
    </Table>
  </TableContainer>
);

export const SolarTermBoundaryRuleTable: React.FC = () => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>步骤</TableCell>
          <TableCell>动作</TableCell>
          <TableCell>输出</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow><TableCell>1</TableCell><TableCell>读取出生时刻（精确到分钟）</TableCell><TableCell>出生时间戳</TableCell></TableRow>
        <TableRow><TableCell>2</TableCell><TableCell>查询当日交节时刻</TableCell><TableCell>交节时间戳</TableCell></TableRow>
        <TableRow><TableCell>3</TableCell><TableCell>比较前后关系</TableCell><TableCell>节前 / 节后</TableCell></TableRow>
        <TableRow><TableCell>4</TableCell><TableCell>确定月令并固化月柱</TableCell><TableCell>后续可继续十神/格局分析</TableCell></TableRow>
      </TableBody>
    </Table>
  </TableContainer>
);

export const RuleCardByEntryId: React.FC<{ entryId: string }> = ({ entryId }) => {
  if (entryId === 'lm_sanming') {
    return (
      <>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          规则对照卡：五行生克矩阵
        </Typography>
        <FiveElementsRuleTable />
      </>
    );
  }
  if (entryId === 'lm_yuanhai') {
    return (
      <>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          规则对照卡：十神判定速查（以日主为中心）
        </Typography>
        <TenGodRuleTable />
      </>
    );
  }
  if (entryId === 'lm_jiejie') {
    return (
      <>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          规则对照卡：交节边界判定流程
        </Typography>
        <SolarTermBoundaryRuleTable />
      </>
    );
  }
  return null;
};
