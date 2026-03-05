#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MING_SRCS_DIR="${ROOT_DIR}/srcs"
ANDAOWALLET_H5_DIR="/home/lc/luckee_dao/AnDaoWallet/h5"
KEEP_E2E_ARTIFACTS="${KEEP_E2E_ARTIFACTS:-false}"

# Some runtimes warn when NO_COLOR and FORCE_COLOR are both set.
# Prefer FORCE_COLOR for CI readability and clear NO_COLOR locally.
if [[ -n "${FORCE_COLOR:-}" && -n "${NO_COLOR:-}" ]]; then
  unset NO_COLOR
fi

SKIP_E2E=false
WITH_CONTRACTS=false
if [[ "${1:-}" == "--skip-e2e" ]]; then
  SKIP_E2E=true
fi
if [[ "${1:-}" == "--with-contracts" || "${2:-}" == "--with-contracts" ]]; then
  WITH_CONTRACTS=true
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

cleanup_e2e_artifacts() {
  if [[ "${KEEP_E2E_ARTIFACTS}" == "true" ]]; then
    return
  fi
  rm -rf "${MING_SRCS_DIR}/playwright-report" "${MING_SRCS_DIR}/test-results"
}

echo "[1/5] Ming wallet protocol unit tests..."
(
  cd "${MING_SRCS_DIR}"
  env -u NO_COLOR \
    VITE_WALLET_CONNECTION_MODE= \
    VITE_WALLET_APP_URL= \
    VITE_WALLET_TARGET_ORIGIN= \
    VITE_WALLET_ALLOWED_ORIGINS= \
    npm run test:wallet:unit
)
echo "✅ Ming unit tests passed"
echo ""

if [[ "${SKIP_E2E}" == "false" ]]; then
  cleanup_e2e_artifacts
  echo "[2/5] Install Playwright Chromium runtime (if missing)..."
  (
    cd "${MING_SRCS_DIR}"
    env -u NO_COLOR npx playwright install chromium
  )
  echo "✅ Playwright Chromium ready"
  echo ""

  echo "[3/5] Ming wallet flow E2E smoke..."
  (
    cd "${MING_SRCS_DIR}"
    env -u NO_COLOR npm run test:wallet:e2e:mock
  )
  echo "✅ Ming E2E smoke passed"
  echo ""

  echo "[4/5] Ming cross-window popup handshake E2E..."
  (
    cd "${MING_SRCS_DIR}"
    env -u NO_COLOR npm run test:wallet:e2e:cross-window
  )
  echo "✅ Ming cross-window E2E passed"
  echo ""
  cleanup_e2e_artifacts
else
  echo "[2/5] Skip E2E by flag --skip-e2e"
  echo "[3/5] Skip E2E by flag --skip-e2e"
  echo "[4/5] Skip E2E by flag --skip-e2e"
  echo ""
fi

echo "[5/5] AnDaoWallet Ming bridge checks..."
(
  cd "${ANDAOWALLET_H5_DIR}"
  env -u NO_COLOR npm run type-check
  env -u NO_COLOR npm run test -- MingWalletBridgeService
)
echo "✅ AnDaoWallet checks passed"
echo ""

if [[ "${WITH_CONTRACTS}" == "true" ]]; then
  echo "[extra] Ming EVM contract tests..."
  (
    cd "${ROOT_DIR}/contracts"
    env -u NO_COLOR npm test
  )
  echo "✅ Ming contract tests passed"
  echo ""
fi

echo "=== All wallet integration checks passed ==="
