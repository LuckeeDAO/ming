#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MING_SRCS_DIR="${ROOT_DIR}/srcs"
ANDAOWALLET_H5_DIR="/home/lc/luckee_dao/AnDaoWallet/h5"

SKIP_E2E=false
if [[ "${1:-}" == "--skip-e2e" ]]; then
  SKIP_E2E=true
fi

echo "=== Wallet Integration Checks ==="
echo "Ming srcs: ${MING_SRCS_DIR}"
echo "AnDaoWallet h5: ${ANDAOWALLET_H5_DIR}"
echo ""

if [[ ! -d "${MING_SRCS_DIR}" ]]; then
  echo "❌ Ming srcs directory not found: ${MING_SRCS_DIR}"
  exit 1
fi

if [[ ! -d "${ANDAOWALLET_H5_DIR}" ]]; then
  echo "❌ AnDaoWallet h5 directory not found: ${ANDAOWALLET_H5_DIR}"
  exit 1
fi

echo "[1/5] Ming wallet protocol unit tests..."
(
  cd "${MING_SRCS_DIR}"
  npm run test:ci -- mingWalletInterface
)
echo "✅ Ming unit tests passed"
echo ""

if [[ "${SKIP_E2E}" == "false" ]]; then
  echo "[2/5] Install Playwright Chromium runtime (if missing)..."
  (
    cd "${MING_SRCS_DIR}"
    npx playwright install chromium
  )
  echo "✅ Playwright Chromium ready"
  echo ""

  echo "[3/5] Ming wallet flow E2E smoke..."
  (
    cd "${MING_SRCS_DIR}"
    npm run test:e2e -- e2e/example.spec.ts e2e/wallet-flow.spec.ts --project=chromium
  )
  echo "✅ Ming E2E smoke passed"
  echo ""

  echo "[4/5] Ming cross-window popup handshake E2E..."
  (
    cd "${MING_SRCS_DIR}"
    npx playwright test e2e/wallet-cross-window.spec.ts --project=chromium --config=playwright.cross-window.config.ts
  )
  echo "✅ Ming cross-window E2E passed"
  echo ""
else
  echo "[2/5] Skip E2E by flag --skip-e2e"
  echo "[3/5] Skip E2E by flag --skip-e2e"
  echo "[4/5] Skip E2E by flag --skip-e2e"
  echo ""
fi

echo "[5/5] AnDaoWallet Ming bridge checks..."
(
  cd "${ANDAOWALLET_H5_DIR}"
  npm run type-check
  npm run test -- MingWalletBridgeService
)
echo "✅ AnDaoWallet checks passed"
echo ""

echo "=== All wallet integration checks passed ==="
