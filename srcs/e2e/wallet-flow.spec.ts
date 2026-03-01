import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
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

    const originalPostMessage = window.postMessage.bind(window);
    window.postMessage = ((message: any, targetOrigin?: string, transfer?: Transferable[]) => {
      if (message?.type === 'MING_WALLET_GET_ACTIVE_ACCOUNT_REQUEST') {
        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent('message', {
              origin: window.location.origin,
              source: window,
              data: {
                type: 'MING_WALLET_GET_ACTIVE_ACCOUNT_RESPONSE',
                messageId: message.messageId,
                payload: {
                  success: true,
                  data: {
                    walletAddress: '0x1234567890123456789012345678901234567890',
                    chainFamily: 'evm',
                    chainId: 43113,
                    network: 'avalanche-fuji-testnet',
                    status: 'connected',
                  },
                },
              },
            })
          );
        }, 0);
        return;
      }

      if (message?.type === 'MING_WALLET_MINT_NFT_REQUEST') {
        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent('message', {
              origin: window.location.origin,
              source: window,
              data: {
                type: 'MING_WALLET_MINT_NFT_RESPONSE',
                messageId: message.messageId,
                payload: {
                  success: true,
                  data: {
                    tokenId: '101',
                    txHash: '0xmocktxhash',
                    blockNumber: 12345,
                  },
                },
              },
            })
          );
        }, 0);
        return;
      }

      if (message?.type === 'MING_WALLET_CREATE_SCHEDULED_TASK_REQUEST') {
        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent('message', {
              origin: window.location.origin,
              source: window,
              data: {
                type: 'MING_WALLET_CREATE_SCHEDULED_TASK_RESPONSE',
                messageId: message.messageId,
                payload: {
                  success: true,
                  data: {
                    taskId: 'task-e2e-001',
                    scheduledTime: new Date(Date.now() + 3600_000).toISOString(),
                    status: 'pending',
                  },
                },
              },
            })
          );
        }, 0);
        return;
      }

      return originalPostMessage(message, targetOrigin as any, transfer as any);
    }) as typeof window.postMessage;
  });

  await page.route('https://api.pinata.cloud/pinning/pinFileToIPFS', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ IpfsHash: `QmMock${Date.now()}` }),
    });
  });

  await page.route('https://api.pinata.cloud/pinning/pinJSONToIPFS', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ IpfsHash: `QmMockJson${Date.now()}` }),
    });
  });
});

test('SimpleMint 通过钱包接口完成铸造（Mock 钱包）', async ({ page }) => {
  await page.goto('/simple-mint');

  await page.getByRole('button', { name: /连接( AnDaoWallet)?钱包/ }).click();
  await expect(page.getByRole('button', { name: /0x1234...7890/i })).toBeVisible();

  await page.setInputFiles('#image-upload', {
    name: 'demo.png',
    mimeType: 'image/png',
    buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  });

  await page.getByPlaceholder('为这个NFT添加描述...').fill('E2E mock mint flow');
  await page.getByRole('button', { name: '签名并铸造' }).click();

  await expect(page.getByText('铸造成功！')).toBeVisible();
  await expect(page.getByText('Token ID: 101')).toBeVisible();
});
