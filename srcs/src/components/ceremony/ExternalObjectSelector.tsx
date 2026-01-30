/**
 * 外物选择组件
 * 
 * 功能：
 * - 展示推荐的外物列表
 * - 支持外物详情查看
 * - 支持外物选择
 * - 显示外物与能量的对应关系
 * 
 * @module components/ceremony/ExternalObjectSelector
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ExternalObject, ConnectionMethod } from '../../types/energy';

interface ExternalObjectSelectorProps {
  objects: ExternalObject[];
  selectedObjectId?: string;
  onSelect: (object: ExternalObject) => void;
  onConfirm?: (object: ExternalObject) => void;
}

/**
 * 外物选择组件
 * 
 * @param props - 组件属性
 * @param props.objects - 外物列表
 * @param props.selectedObjectId - 已选择的外物ID（可选）
 * @param props.onSelect - 选择外物回调
 * @param props.onConfirm - 确认选择回调（可选）
 */
const ExternalObjectSelector: React.FC<ExternalObjectSelectorProps> = ({
  objects,
  selectedObjectId,
  onSelect,
  onConfirm,
}: ExternalObjectSelectorProps) => {
  const [selectedObject, setSelectedObject] = useState<ExternalObject | null>(
    objects.find((obj: ExternalObject) => obj.id === selectedObjectId) || null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailObject, setDetailObject] = useState<ExternalObject | null>(null);

  /**
   * 获取五行元素中文名称
   * 
   * @param element - 元素英文名
   * @returns 中文名称
   */
  const getElementName = (
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  ): string => {
    const names: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    return names[element] || element;
  };

  /**
   * 获取元素颜色
   * 
   * @param element - 元素英文名
   * @returns Material-UI 颜色名称
   */
  const getElementColor = (
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  ): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    const colors: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
      wood: 'success',
      fire: 'error',
      earth: 'warning',
      metal: 'info',
      water: 'default',
    };
    return colors[element] || 'default';
  };

  /**
   * 处理外物选择
   * 
   * @param object - 选择的外物
   */
  const handleSelect = (object: ExternalObject) => {
    setSelectedObject(object);
    onSelect(object);
  };

  /**
   * 打开详情对话框
   * 
   * @param object - 要查看详情的外物
   */
  const handleOpenDetail = (object: ExternalObject) => {
    setDetailObject(object);
    setDetailDialogOpen(true);
  };

  /**
   * 关闭详情对话框
   */
  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setDetailObject(null);
  };

  /**
   * 处理确认选择
   */
  const handleConfirm = () => {
    if (selectedObject && onConfirm) {
      onConfirm(selectedObject);
    }
  };

  if (objects.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            暂无推荐外物
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        选择外物
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        根据能量分析结果，以下外物适合您进行连接
      </Typography>

      <Grid container spacing={2}>
        {objects.map((object: ExternalObject) => (
          <Grid item xs={12} sm={6} md={4} key={object.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                border:
                  selectedObject?.id === object.id ? 2 : 0,
                borderColor: 'primary.main',
              }}
              onClick={() => handleSelect(object)}
            >
              {object.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={object.image}
                  alt={object.name}
                />
              )}
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" component="h3">
                    {object.name}
                  </Typography>
                  <Chip
                    label={getElementName(object.element)}
                    color={getElementColor(object.element)}
                    size="small"
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {object.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(object);
                    }}
                  >
                    查看详情
                  </Button>
                  {selectedObject?.id === object.id && (
                    <Chip label="已选择" color="primary" size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 详情对话框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        {detailObject && (
          <>
            <DialogTitle>{detailObject.name}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                {detailObject.image && (
                  <Box
                    component="img"
                    src={detailObject.image}
                    alt={detailObject.name}
                    sx={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'contain',
                      mb: 2,
                    }}
                  />
                )}
                <Typography variant="body1" paragraph>
                  {detailObject.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    五行属性
                  </Typography>
                  <Chip
                    label={getElementName(detailObject.element)}
                    color={getElementColor(detailObject.element)}
                  />
                </Box>
                {detailObject.connectionMethods && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      连接方式
                    </Typography>
                    {detailObject.connectionMethods.map((method: ConnectionMethod, index: number) => (
                      <Card key={index} sx={{ mb: 1 }}>
                        <CardContent>
                          <Typography variant="body2" fontWeight="bold">
                            {method.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {method.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            难度：{method.difficulty} | 预计时间：{method.estimatedTime}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetail}>关闭</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (detailObject) {
                    handleSelect(detailObject);
                    handleCloseDetail();
                  }
                }}
              >
                选择此外物
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 确认按钮 */}
      {selectedObject && onConfirm && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleConfirm}>
            确认选择
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ExternalObjectSelector;
