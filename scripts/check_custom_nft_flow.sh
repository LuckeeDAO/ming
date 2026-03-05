#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONTRACTS_DIR="${PROJECT_ROOT}/contracts"

NETWORK="${1:-sepolia}"
CONTRACT_ADDRESS_ARG="${2:-}"
NPM_INSTALL_RETRY="${NPM_INSTALL_RETRY:-3}"
CONTRACTS_SKIP_NPM_INSTALL="${CONTRACTS_SKIP_NPM_INSTALL:-false}"

if [ "${NETWORK}" = "hardhat" ]; then
  echo "[error] hardhat network is ephemeral and resets on each command." >&2
  echo "[hint] use localhost (persistent hardhat node) or a real network such as sepolia/fuji." >&2
  exit 1
fi

if [ ! -d "${CONTRACTS_DIR}" ]; then
  echo "contracts directory not found: ${CONTRACTS_DIR}" >&2
  exit 1
fi

resolve_contract_address() {
  if [ -n "${CONTRACT_ADDRESS_ARG}" ]; then
    printf '%s' "${CONTRACT_ADDRESS_ARG}"
    return
  fi

  if [ -n "${CONTRACT_ADDRESS:-}" ]; then
    printf '%s' "${CONTRACT_ADDRESS}"
    return
  fi

  local latest
  latest="$(ls -1t "${CONTRACTS_DIR}/deployments/${NETWORK}-"*.json 2>/dev/null | head -n1 || true)"
  if [ -n "${latest}" ]; then
    node -e "const fs=require('fs');const f='${latest}';const d=JSON.parse(fs.readFileSync(f,'utf8'));if(!d.contractAddress){process.exit(1)};process.stdout.write(d.contractAddress)" || true
    return
  fi

  printf '%s' ""
}

ADDR="$(resolve_contract_address)"
if [ -z "${ADDR}" ]; then
  echo "CONTRACT_ADDRESS is required (arg/env/deployments JSON)." >&2
  echo "Usage: ./scripts/check_custom_nft_flow.sh <network> [contract_address]" >&2
  exit 1
fi

cd "${CONTRACTS_DIR}"

ensure_deps() {
  if [ "${CONTRACTS_SKIP_NPM_INSTALL}" = "true" ]; then
    echo "[warn] CONTRACTS_SKIP_NPM_INSTALL=true, skip npm install"
    return
  fi

  if [ -d node_modules ]; then
    return
  fi

  local attempt=1
  while [ "${attempt}" -le "${NPM_INSTALL_RETRY}" ]; do
    echo "[deps] npm install attempt ${attempt}/${NPM_INSTALL_RETRY}"
    if npm install; then
      return
    fi
    attempt=$((attempt + 1))
    sleep 2
  done

  echo "[error] npm install failed after ${NPM_INSTALL_RETRY} attempts." >&2
  echo "[hint] check network/proxy, or pre-install deps in ${CONTRACTS_DIR}" >&2
  echo "[hint] you can set CONTRACTS_SKIP_NPM_INSTALL=true when deps already exist." >&2
  exit 1
}

ensure_deps

echo "Run custom NFT flow static checks"
echo "Network: ${NETWORK}"
echo "Contract: ${ADDR}"

CONTRACT_ADDRESS="${ADDR}" npx hardhat run scripts/check_mint_permission.js --network "${NETWORK}"
