/**
 * E2E测试示例
 * 
 * 端到端测试的基础示例
 * 
 * @module e2e/example.spec
 */

import { test, expect } from '@playwright/test';

test('首页应该正常加载', async ({ page }) => {
  await page.goto('/');
  
  // 检查页面标题
  await expect(page).toHaveTitle(/Ming/i);
  
  // 检查关键元素是否存在
  const header = page.locator('header');
  await expect(header).toBeVisible();
});

test('兼容路由应该重定向到统一仪式页面', async ({ page }) => {
  await page.goto('/scheduled-mints');
  await expect(page).toHaveURL(/connection-ceremony\?tab=1/);
});

test('仪式页标签切换应该同步URL', async ({ page }) => {
  await page.goto('/connection-ceremony?tab=0');
  await page.getByRole('tab', { name: '仪式资源' }).click();
  await expect(page).toHaveURL(/connection-ceremony\?tab=2/);
});

test('钱包连接后应显示缩略地址', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).ethereum = {
      request: async ({ method }: { method: string }) => {
        if (method === 'eth_requestAccounts') {
          return ['0x1234567890123456789012345678901234567890'];
        }
        if (method === 'eth_chainId') {
          return '0xa869';
        }
        return null;
      },
      on: () => {},
      removeListener: () => {},
    };
  });

  await page.goto('/');
  const connectButton = page.getByRole('button', { name: '连接钱包' });
  await expect(connectButton).toBeVisible();
  await connectButton.click();

  await expect(page.getByRole('button', { name: /0x1234...7890/i })).toBeVisible();
});
