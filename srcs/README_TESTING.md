# 测试指南

本文档说明如何运行和编写项目的测试代码。

## 📋 测试结构

项目包含以下类型的测试：

1. **单元测试** - 测试工具函数和服务层
2. **组件测试** - 测试React组件
3. **E2E测试** - 端到端测试

## 🚀 运行测试

### 运行所有测试

```bash
npm test
```

### 运行测试并查看UI

```bash
npm run test:ui
```

### 运行E2E测试

```bash
npm run test:e2e
```

### 运行特定测试文件

```bash
# 运行特定测试文件
npm test helpers.test.ts

# 运行特定目录的测试
npm test utils/
```

## 📁 测试文件结构

```
srcs/
├── src/
│   └── __tests__/
│       ├── setup.ts              # 测试环境设置
│       ├── components/           # 组件测试
│       │   └── DateTimePicker.test.tsx
│       ├── services/             # 服务层测试
│       │   ├── ipfsService.test.ts
│       │   └── scheduledMint.test.ts
│       └── utils/                # 工具函数测试
│           ├── helpers.test.ts
│           ├── validation.test.ts
│           └── format.test.ts
└── e2e/                          # E2E测试
    └── example.spec.ts
```

## ✍️ 编写测试

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { formatAddress } from '../../utils/format';

describe('formatAddress', () => {
  it('应该格式化钱包地址', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
    const formatted = formatAddress(address);
    
    expect(formatted).toContain('...');
  });
});
```

### 组件测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DateTimePicker from '../../components/ceremony/DateTimePicker';

describe('DateTimePicker', () => {
  it('应该渲染日期时间选择器', () => {
    render(<DateTimePicker value={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/选择日期和时间/i)).toBeInTheDocument();
  });
});
```

### E2E测试示例

```typescript
import { test, expect } from '@playwright/test';

test('首页应该正常加载', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Ming/i);
});
```

## 🔧 测试配置

### Vitest配置

配置文件：`vitest.config.ts`

主要配置：
- 使用jsdom环境（支持DOM API）
- 自动清理测试环境
- 代码覆盖率报告

### Playwright配置

配置文件：`playwright.config.ts`

主要配置：
- 支持Chrome、Firefox、Safari
- 自动启动开发服务器
- 失败重试机制

## 📊 代码覆盖率

运行测试覆盖率报告：

```bash
npm test -- --coverage
```

覆盖率报告会生成在 `coverage/` 目录。

## 🐛 调试测试

### 调试单元测试

在测试文件中添加 `debugger` 语句，然后运行：

```bash
npm test -- --inspect-brk
```

### 调试E2E测试

使用Playwright的调试模式：

```bash
npx playwright test --debug
```

## 📝 测试最佳实践

1. **测试命名**：使用描述性的测试名称
2. **测试隔离**：每个测试应该独立运行
3. **Mock外部依赖**：Mock API调用和浏览器API
4. **测试边界情况**：测试正常情况和异常情况
5. **保持测试简单**：每个测试只测试一个功能点

## 🔍 已实现的测试

### 工具函数测试
- ✅ `helpers.test.ts` - 辅助函数测试
- ✅ `validation.test.ts` - 验证函数测试
- ✅ `format.test.ts` - 格式化函数测试

### 服务层测试
- ✅ `ipfsService.test.ts` - IPFS服务测试
- ✅ `scheduledMint.test.ts` - 定时MINT服务测试

### 组件测试
- ✅ `DateTimePicker.test.tsx` - 日期时间选择器测试

### E2E测试
- ✅ `example.spec.ts` - 基础E2E测试示例

## 🚧 待补充的测试

- [ ] 更多组件测试（WalletConnect、ExternalObjectSelector等）
- [ ] 页面组件测试（NFTCeremony、MyConnections等）
- [ ] 完整的E2E测试流程
- [ ] 性能测试
- [ ] 可访问性测试

## 📚 相关资源

- [Vitest文档](https://vitest.dev/)
- [React Testing Library文档](https://testing-library.com/react)
- [Playwright文档](https://playwright.dev/)
