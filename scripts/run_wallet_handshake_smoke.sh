#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MING_SRCS_DIR="${ROOT_DIR}/srcs"

if [[ ! -d "${MING_SRCS_DIR}" ]]; then
  echo "❌ Ming srcs directory not found: ${MING_SRCS_DIR}"
  exit 1
fi

echo "=== Wallet Handshake Smoke ==="
echo "Target: GET_ACTIVE_ACCOUNT request/response"
echo "Ming srcs: ${MING_SRCS_DIR}"
echo ""

(
  cd "${MING_SRCS_DIR}"
  npm run test:ci -- mingWalletInterface -t "应支持查询钱包当前活跃地址|应支持跨窗口钱包来源的响应匹配（AnDaoWallet窗口）"
)

echo ""
echo "✅ Handshake smoke passed"
