#!/usr/bin/env bash

set -euo pipefail

MING_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MING_ENV_FILE="${MING_ROOT}/srcs/.env.local"
MING_ENV_FALLBACK_FILE="${MING_ROOT}/srcs/env.local"
WALLET_ROOT="/home/lc/luckee_dao/AnDaoWallet/h5"
WALLET_ENV_FILE="${WALLET_ROOT}/.env.local"
WALLET_ENV_FALLBACK_FILE="${WALLET_ROOT}/env.local"

resolve_env_file() {
  local preferred="$1"
  local fallback="$2"
  if [[ -f "${preferred}" ]]; then
    echo "${preferred}"
    return 0
  fi
  if [[ -f "${fallback}" ]]; then
    echo "${fallback}"
    return 0
  fi
  return 1
}

get_env_value() {
  local file="$1"
  local key="$2"
  if [[ ! -f "$file" ]]; then
    return 1
  fi
  local line
  line="$(rg -n "^${key}=" "$file" -m 1 | sed -E 's/^[0-9]+://')"
  if [[ -z "$line" ]]; then
    return 1
  fi
  echo "${line#*=}" | sed -E 's/^"(.*)"$/\1/' | sed -E "s/^'(.*)'$/\1/"
  return 0
}

require_non_empty() {
  local name="$1"
  local value="$2"
  if [[ -z "${value}" ]]; then
    echo "❌ missing: ${name}"
    return 1
  fi
  echo "✅ ${name}=${value}"
  return 0
}

echo "=== Wallet Cross-Window Preflight ==="

if [[ ! -f "${MING_ENV_FILE}" ]]; then
  MING_ENV_FILE="$(resolve_env_file "${MING_ENV_FILE}" "${MING_ENV_FALLBACK_FILE}" || true)"
  if [[ -z "${MING_ENV_FILE}" ]]; then
    echo "❌ Ming env file not found: ${MING_ROOT}/srcs/.env.local or ${MING_ROOT}/srcs/env.local"
    exit 1
  fi
fi

if [[ ! -f "${WALLET_ENV_FILE}" ]]; then
  WALLET_ENV_FILE="$(resolve_env_file "${WALLET_ENV_FILE}" "${WALLET_ENV_FALLBACK_FILE}" || true)"
  if [[ -z "${WALLET_ENV_FILE}" ]]; then
    echo "❌ Wallet env file not found: ${WALLET_ROOT}/.env.local or ${WALLET_ROOT}/env.local"
    exit 1
  fi
fi

echo "Ming env: ${MING_ENV_FILE}"
echo "Wallet env: ${WALLET_ENV_FILE}"
echo ""

MING_APP_URL="$(get_env_value "${MING_ENV_FILE}" "VITE_WALLET_APP_URL" || true)"
MING_TARGET_ORIGIN="$(get_env_value "${MING_ENV_FILE}" "VITE_WALLET_TARGET_ORIGIN" || true)"
MING_ALLOWED_ORIGINS="$(get_env_value "${MING_ENV_FILE}" "VITE_WALLET_ALLOWED_ORIGINS" || true)"
MING_CHAIN_FAMILY="$(get_env_value "${MING_ENV_FILE}" "VITE_CHAIN_FAMILY" || true)"
MING_CHAIN_NETWORK="$(get_env_value "${MING_ENV_FILE}" "VITE_CHAIN_NETWORK" || true)"

WALLET_ALLOWED_ORIGINS="$(get_env_value "${WALLET_ENV_FILE}" "VITE_MING_ALLOWED_ORIGINS" || true)"
WALLET_SOLANA_NETWORK="$(get_env_value "${WALLET_ENV_FILE}" "VITE_SOLANA_NETWORK" || true)"

ok=true

require_non_empty "Ming.VITE_WALLET_APP_URL" "${MING_APP_URL}" || ok=false
require_non_empty "Ming.VITE_WALLET_TARGET_ORIGIN" "${MING_TARGET_ORIGIN}" || ok=false
require_non_empty "Ming.VITE_WALLET_ALLOWED_ORIGINS" "${MING_ALLOWED_ORIGINS}" || ok=false
require_non_empty "Ming.VITE_CHAIN_FAMILY" "${MING_CHAIN_FAMILY}" || ok=false
require_non_empty "Ming.VITE_CHAIN_NETWORK" "${MING_CHAIN_NETWORK}" || ok=false
require_non_empty "AnDaoWallet.VITE_MING_ALLOWED_ORIGINS" "${WALLET_ALLOWED_ORIGINS}" || ok=false

if [[ "${MING_CHAIN_FAMILY}" == "solana" ]]; then
  require_non_empty "AnDaoWallet.VITE_SOLANA_NETWORK" "${WALLET_SOLANA_NETWORK}" || ok=false
else
  echo "ℹ️  skip: AnDaoWallet.VITE_SOLANA_NETWORK (Ming chain family is ${MING_CHAIN_FAMILY:-unknown})"
fi

if [[ "${MING_TARGET_ORIGIN}" != "${MING_APP_URL}" ]]; then
  echo "❌ mismatch: VITE_WALLET_TARGET_ORIGIN should equal VITE_WALLET_APP_URL"
  ok=false
else
  echo "✅ targetOrigin matches appUrl"
fi

if ! echo "${MING_ALLOWED_ORIGINS}" | tr ',' '\n' | rg -qx "${MING_TARGET_ORIGIN}"; then
  echo "❌ mismatch: Ming allowed origins do not include target origin"
  ok=false
else
  echo "✅ Ming allowed origins include target origin"
fi

if ! echo "${WALLET_ALLOWED_ORIGINS}" | tr ',' '\n' | rg -qx "http://localhost:5174"; then
  echo "⚠️  warning: wallet allowed origins does not explicitly include http://localhost:5174"
fi

if [[ "${MING_CHAIN_FAMILY}" == "solana" && "${MING_CHAIN_NETWORK}" != "${WALLET_SOLANA_NETWORK}" ]]; then
  echo "❌ mismatch: Ming chain network and wallet solana network are different"
  ok=false
else
  echo "✅ chain network alignment check passed"
fi

echo ""
if [[ "${ok}" == "true" ]]; then
  echo "✅ Cross-window preflight passed"
  exit 0
fi

echo "❌ Cross-window preflight failed"
exit 1
