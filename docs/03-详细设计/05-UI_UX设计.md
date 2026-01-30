# UI/UX设计

## 1. 设计概述

### 1.1 设计理念

Ming平台的UI/UX设计遵循以下核心理念：

- **极简主义**: 信息极简、操作极简、视觉极简
- **仪式感**: 营造庄重、有意义的仪式体验
- **文化融合**: 传统文化元素与现代设计结合
- **用户友好**: 清晰直观，易于理解和使用

### 1.2 设计原则

1. **清晰性**: 信息层次清晰，重点突出
2. **一致性**: 设计语言统一，交互一致
3. **可访问性**: 支持多种设备和用户需求
4. **美观性**: 现代美观，符合文化审美

## 2. 视觉设计

### 2.1 色彩系统

#### 2.1.1 主色调
```typescript
const colors = {
  // 主色
  primary: {
    main: '#6B46C1',      // 紫色（神秘、仪式感）
    light: '#8B5CF6',
    dark: '#553C9A',
  },
  
  // 辅助色
  secondary: {
    main: '#F59E0B',      // 金色（能量、光明）
    light: '#FBBF24',
    dark: '#D97706',
  },
  
  // 五行颜色
  elements: {
    wood: '#10B981',      // 绿色（木）
    fire: '#EF4444',      // 红色（火）
    earth: '#F59E0B',     // 黄色（土）
    metal: '#6B7280',     // 灰色（金）
    water: '#3B82F6',     // 蓝色（水）
  },
  
  // 中性色
  neutral: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  },
};
```

#### 2.1.2 色彩使用
- **主色**: 用于主要操作按钮、重要信息
- **辅助色**: 用于强调、提示
- **五行色**: 用于能量展示、外物标识
- **中性色**: 用于背景、文本、边框

### 2.2  typography（字体）

#### 2.2.1 字体选择
```typescript
const typography = {
  fontFamily: {
    primary: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
    display: '"Noto Serif SC", serif',  // 用于标题、仪式感文字
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
```

#### 2.2.2 字体使用
- **标题**: 使用display字体，较大字号，加粗
- **正文**: 使用primary字体，常规字号
- **强调**: 使用较大字号或加粗

### 2.3 图标系统

#### 2.3.1 图标库
- Material-UI Icons（主要）
- 自定义图标（五行、仪式相关）

#### 2.3.2 图标使用
- 功能图标：清晰表达功能
- 装饰图标：增强视觉效果
- 五行图标：标识能量类型

### 2.4 间距系统

#### 2.4.1 间距规范
```typescript
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};
```

#### 2.4.2 留白原则
- 重要内容周围留白充足
- 相关元素间距较小
- 不相关元素间距较大

## 3. 组件设计

### 3.1 按钮组件

#### 3.1.1 主要按钮
```typescript
// 主要操作按钮
<Button variant="contained" color="primary" size="large">
  开始连接
</Button>
```

#### 3.1.2 次要按钮
```typescript
// 次要操作按钮
<Button variant="outlined" color="primary">
  了解更多
</Button>
```

#### 3.1.3 仪式按钮
```typescript
// 仪式相关按钮（特殊样式）
<Button 
  variant="contained" 
  className="ceremony-button"
  startIcon={<Icon />}
>
  完成仪式
</Button>
```

### 3.2 卡片组件

#### 3.2.1 外物卡片
```typescript
<Card className="external-object-card">
  <CardMedia image={object.image} />
  <CardContent>
    <Typography variant="h6">{object.name}</Typography>
    <Chip label={object.element} color={getElementColor(object.element)} />
    <Typography variant="body2">{object.description}</Typography>
  </CardContent>
  <CardActions>
    <Button>选择</Button>
    <Button>详情</Button>
  </CardActions>
</Card>
```

#### 3.2.2 NFT卡片
```typescript
<Card className="nft-card">
  <CardMedia image={nft.image} />
  <CardContent>
    <Typography variant="h6">{nft.name}</Typography>
    <Typography variant="body2" color="textSecondary">
      {formatDate(nft.connectionDate)}
    </Typography>
  </CardContent>
</Card>
```

### 3.3 表单组件

#### 3.3.1 四柱八字输入
```typescript
<Grid container spacing={2}>
  <Grid item xs={6}>
    <FormControl fullWidth>
      <InputLabel>年柱</InputLabel>
      <Select value={year} onChange={handleYearChange}>
        {yearOptions.map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
  {/* 其他柱 */}
</Grid>
```

### 3.4 图表组件

#### 3.4.1 能量分布图
```typescript
<BarChart data={energyData}>
  <Bar dataKey="value" fill={getElementColor(element)} />
  <XAxis dataKey="element" />
  <YAxis />
</BarChart>
```

## 4. 页面设计

### 4.1 首页设计

#### 4.1.1 布局结构
```
┌─────────────────────────────────┐
│         Header (导航栏)          │
├─────────────────────────────────┤
│                                 │
│      Hero Section (英雄区)      │
│      - 主标题                    │
│      - 副标题                    │
│      - CTA按钮                   │
│                                 │
├─────────────────────────────────┤
│   Quick Start Section           │
│   - 三步流程                     │
│   - 快速入口                     │
├─────────────────────────────────┤
│   Feature Section               │
│   - 核心功能展示                 │
├─────────────────────────────────┤
│         Footer                  │
└─────────────────────────────────┘
```

#### 4.1.2 设计要点
- 大标题突出平台理念
- 清晰的行动号召
- 简洁的功能展示

### 4.2 核心概念页

#### 4.2.1 布局结构
```
┌─────────────────────────────────┐
│         Header                  │
├─────────────────────────────────┤
│   Concept Introduction          │
│   - 能量循环概念                 │
│   - 可视化图表                   │
├─────────────────────────────────┤
│   Missing Element Section       │
│   - 缺失元素说明                 │
│   - 自我感受指引                 │
├─────────────────────────────────┤
│   External Connection Section   │
│   - 外物连接概念                 │
│   - 连接方式介绍                 │
├─────────────────────────────────┤
│   Disclaimer Section           │
│   - 免责声明                     │
└─────────────────────────────────┘
```

### 4.3 NFT仪式页

#### 4.3.1 步骤指示器
```typescript
<Stepper activeStep={currentStep}>
  <Step>
    <StepLabel>准备</StepLabel>
  </Step>
  <Step>
    <StepLabel>创建</StepLabel>
  </Step>
  <Step>
    <StepLabel>铸造</StepLabel>
  </Step>
  <Step>
    <StepLabel>完成</StepLabel>
  </Step>
</Stepper>
```

#### 4.3.2 仪式感设计
- 步骤过渡动画
- 完成时的庆祝效果
- 庄重的视觉提示

## 5. 交互设计

### 5.1 动画效果

#### 5.1.1 页面过渡
```typescript
// 使用Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

#### 5.1.2 交互反馈
- 按钮悬停效果
- 点击反馈
- 加载动画
- 成功/失败提示

### 5.2 微交互

#### 5.2.1 按钮交互
- 悬停：颜色变化、阴影
- 点击：按下效果
- 加载：旋转动画

#### 5.2.2 表单交互
- 输入焦点：边框高亮
- 验证反馈：即时提示
- 错误提示：红色边框、错误信息

## 6. 响应式设计

### 6.1 断点设置

```typescript
const breakpoints = {
  xs: 0,      // 手机
  sm: 600,    // 平板
  md: 960,    // 小桌面
  lg: 1280,   // 桌面
  xl: 1920,   // 大桌面
};
```

### 6.2 移动端适配

#### 6.2.1 布局调整
- 单列布局
- 简化导航
- 触摸友好

#### 6.2.2 交互优化
- 增大点击区域
- 简化操作流程
- 优化表单输入

## 7. 可访问性

### 7.1 无障碍设计

#### 7.1.1 语义化HTML
- 使用正确的HTML标签
- ARIA属性
- 键盘导航支持

#### 7.1.2 对比度
- 文本与背景对比度≥4.5:1
- 重要信息对比度≥3:1

### 7.2 多语言支持

#### 7.2.1 文本适配
- 中英文切换
- 文本长度适配
- 字体选择

## 8. 设计系统

### 8.1 组件库

#### 8.1.1 基础组件
- Button
- Input
- Card
- Modal
- Toast

#### 8.1.2 业务组件
- FourPillarsInput
- EnergyChart
- ExternalObjectCard
- NFTMintForm

### 8.2 设计令牌

#### 8.2.1 颜色令牌
```typescript
const designTokens = {
  color: {
    primary: colors.primary.main,
    secondary: colors.secondary.main,
    // ...
  },
  spacing: spacing,
  typography: typography,
  // ...
};
```

## 9. 设计规范文档

### 9.1 设计指南

- 色彩使用指南
- 字体使用指南
- 间距使用指南
- 组件使用指南

### 9.2 设计资源

- Figma设计文件
- 图标库
- 图片资源
- 字体文件

## 10. 用户体验流程

### 10.1 新用户流程

1. **进入首页** → 了解平台
2. **连接钱包** → 建立身份
3. **输入四柱** → 开始分析
4. **查看结果** → 了解能量
5. **选择外物** → 准备连接
6. **完成仪式** → 铸造NFT
7. **记录感受** → 完成流程

### 10.2 老用户流程

1. **进入平台** → 自动连接钱包
2. **查看档案** → 查看历史记录
3. **新连接** → 快速开始新连接

## 11. 设计迭代

### 11.1 用户测试

- A/B测试
- 用户访谈
- 可用性测试

### 11.2 持续优化

- 收集反馈
- 数据分析
- 设计迭代
