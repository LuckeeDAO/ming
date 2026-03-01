import { expect, test } from '@playwright/test';

test('跨窗口钱包握手应返回活跃地址并完成连接展示', async ({
  context,
  page,
}) => {
  await context.addInitScript(() => {
    if (!window.opener) {
      return;
    }

    window.addEventListener('message', (event: MessageEvent) => {
      const payload = event.data as { type?: string; messageId?: string } | null;
      if (!payload || payload.type !== 'MING_WALLET_GET_ACTIVE_ACCOUNT_REQUEST') {
        return;
      }

      window.opener?.postMessage(
        {
          type: 'MING_WALLET_GET_ACTIVE_ACCOUNT_RESPONSE',
          messageId: payload.messageId,
          payload: {
            success: true,
            data: {
              walletAddress: '8J8W1ahh6Y1cM1k8oYyU7F2jmYb5x1p6DYk7tV4hyU2S',
              chainFamily: 'solana',
              network: 'solana-devnet',
              status: 'connected',
            },
          },
        },
        event.origin || '*'
      );
    });
  });

  await page.goto('/');

  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: '连接 AnDaoWallet' }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  await expect(page.getByRole('button', { name: /8J8W1a\.\.\.yU2S/i })).toBeVisible();
});
