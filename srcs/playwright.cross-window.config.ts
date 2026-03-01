import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5176',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command:
        'VITE_PINATA_API_KEY=e2e VITE_PINATA_SECRET_KEY=e2e VITE_WALLET_CONNECTION_MODE=andao VITE_WALLET_APP_URL=http://localhost:5177 VITE_WALLET_TARGET_ORIGIN=http://localhost:5177 VITE_WALLET_ALLOWED_ORIGINS=http://localhost:5177 VITE_CHAIN_FAMILY=solana VITE_CHAIN_NETWORK=solana-devnet VITE_NFT_CONTRACT_ADDRESS=5Ga3kk79rpPJy5joLvZKoJowRsEGvfcMpSDqAahYEVKT npm run dev -- --host 127.0.0.1 --port 5176',
      url: 'http://localhost:5176',
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'python3 -m http.server 5177 --bind 127.0.0.1 --directory e2e/wallet-mock',
      url: 'http://localhost:5177',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
