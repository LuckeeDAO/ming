#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONTRACTS_DIR="${PROJECT_ROOT}/contracts"

NETWORK="${1:-sepolia}"
NPM_INSTALL_RETRY="${NPM_INSTALL_RETRY:-3}"
CONTRACTS_SKIP_NPM_INSTALL="${CONTRACTS_SKIP_NPM_INSTALL:-false}"
GLOBAL_ENV_FILE="${PROJECT_ROOT}/../env/.env"

if [ ! -d "${CONTRACTS_DIR}" ]; then
  echo "contracts directory not found: ${CONTRACTS_DIR}" >&2
  exit 1
fi

cd "${CONTRACTS_DIR}"

load_env_file() {
  local env_file="$1"
  if [ ! -f "${env_file}" ]; then
    return
  fi

  while IFS= read -r line || [ -n "${line}" ]; do
    case "${line}" in
      ''|'#'*)
        continue
        ;;
    esac

    if ! printf '%s' "${line}" | grep -Eq '^[A-Za-z_][A-Za-z0-9_]*='; then
      continue
    fi

    local key="${line%%=*}"
    local value="${line#*=}"

    if [[ "${value}" =~ ^\".*\"$ ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "${value}" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "${key}=${value}"
  done < "${env_file}"
}

normalize_private_key() {
  if [ -z "${PRIVATE_KEY:-}" ]; then
    return
  fi

  if [[ "${PRIVATE_KEY}" != 0x* ]]; then
    PRIVATE_KEY="0x${PRIVATE_KEY}"
    export PRIVATE_KEY
  fi
}

# 先加载统一环境目录，再用 contracts/.env 覆盖（项目局部优先）
load_env_file "${GLOBAL_ENV_FILE}"
load_env_file "${CONTRACTS_DIR}/.env"
normalize_private_key

if [ "${NETWORK}" != "hardhat" ] && [ "${NETWORK}" != "localhost" ]; then
  if [ -z "${PRIVATE_KEY:-}" ]; then
    echo "[error] PRIVATE_KEY is required for network=${NETWORK}" >&2
    echo "[hint] set PRIVATE_KEY in ${CONTRACTS_DIR}/.env or ${GLOBAL_ENV_FILE}" >&2
    exit 1
  fi
fi

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

echo "[1/4] Prepare dependencies"
ensure_deps

echo "[2/4] Preflight (network=${NETWORK})"
npx hardhat run scripts/preflight_deploy.js --network "${NETWORK}"

echo "[3/4] Compile contracts"
npx hardhat clean
npm run compile

echo "[4/4] Deploy ConnectionNFT (network=${NETWORK})"
case "${NETWORK}" in
  localhost)
    npm run deploy:local
    ;;
  goerli)
    npm run deploy:goerli
    ;;
  sepolia)
    npm run deploy:sepolia
    ;;
  fuji)
    npm run deploy:fuji
    ;;
  avalanche)
    npm run deploy:avalanche
    ;;
  mainnet)
    npm run deploy:mainnet
    ;;
  *)
    npx hardhat run scripts/deploy.js --network "${NETWORK}"
    ;;
esac

LATEST_FILE="$(ls -1t deployments/${NETWORK}-*.json 2>/dev/null | head -n1 || true)"
if [ -n "${LATEST_FILE}" ]; then
  echo "Deployment record: ${CONTRACTS_DIR}/${LATEST_FILE}"
fi
