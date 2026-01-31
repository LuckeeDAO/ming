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

test('导航应该正常工作', async ({ page }) => {
  await page.goto('/');
  
  // 点击导航链接
  await page.click('text=连接指导');
  await expect(page).toHaveURL(/connection-guide/);
  
  await page.click('text=NFT仪式');
  await expect(page).toHaveURL(/nft-ceremony/);
});

test('钱包连接功能应该显示', async ({ page }) => {
  await page.goto('/');
  
  // 检查钱包连接按钮是否存在
  const walletButton = page.locator('button:has-text("连接钱包")');
  await expect(walletButton).toBeVisible();
});
