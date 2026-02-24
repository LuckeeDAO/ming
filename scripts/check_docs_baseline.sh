#!/usr/bin/env bash
set -euo pipefail

# Ming docs baseline consistency checker
# - Scans current normative docs for legacy terms/protocol fields/routes
# - Exits non-zero when violations are found

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TARGETS=(
  "README.md"
  "docs/README.md"
  "docs/check_list.md"
  "docs/00-现行口径基线.md"
  "docs/钱包接口"
  "docs/01-项目概述"
  "docs/02-概要设计"
  "docs/03-详细设计"
  "docs/04-开发指南"
  "docs/05-部署运维"
)

EXIT_CODE=0
STRICT_TARGETS=(
  "README.md"
  "docs/README.md"
  "docs/check_list.md"
  "docs/钱包接口"
  "docs/01-项目概述"
  "docs/02-概要设计"
  "docs/03-详细设计"
  "docs/04-开发指南"
  "docs/05-部署运维"
)

print_header() {
  echo
  echo "== $1 =="
}

print_violation() {
  local title="$1"
  local output="$2"
  if [[ -n "$output" ]]; then
    EXIT_CODE=1
    print_header "$title"
    echo "$output"
  fi
}

# 1) Forbidden terminology in current normative docs
term_hits="$(rg -n \
  "改命平台|Web3改命|命—明—改命|前端直连写链|前端轮询定时任务" \
  "${STRICT_TARGETS[@]}" || true)"
print_violation "Forbidden Terms" "$term_hits"

# 2) Legacy wallet protocol fields/messages
legacy_protocol_hits_1="$(rg -n \
  "MING_WALLET_RESPONSE_|\\brequestId\\b|MING_WALLET_GET_ALL_TASKS|\\bmintData\\b" \
  "${TARGETS[@]}" || true)"
print_violation "Legacy Wallet Protocol (direct)" "$legacy_protocol_hits_1"

legacy_protocol_hits_2="$(rg -n --pcre2 \
  "MING_WALLET_MINT_NFT(?!_(REQUEST|RESPONSE))" \
  "${TARGETS[@]}" || true)"
print_violation "Legacy Wallet Protocol (MING_WALLET_MINT_NFT)" "$legacy_protocol_hits_2"

# 3) Legacy routes used as primary entry (allow compatibility context)
route_hits_raw="$(rg -n \
  "/concept|/ceremony-resources|/connection-guide|/nft-ceremony|/scheduled-mints" \
  "${STRICT_TARGETS[@]}" || true)"
route_hits_filtered="$(printf "%s\n" "$route_hits_raw" | rg -v "兼容|重定向|历史路由|历史兼容|Navigate to|原独立页面" || true)"
print_violation "Legacy Routes Used As Primary" "$route_hits_filtered"

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "Docs baseline check passed."
else
  echo
  echo "Docs baseline check failed. Please align the findings with docs/00-现行口径基线.md"
fi

exit $EXIT_CODE
