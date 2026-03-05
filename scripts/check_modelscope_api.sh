#!/usr/bin/env bash
set -euo pipefail

# Quick connectivity check for ModelScope API-Inference (OpenAI-compatible).
# Usage:
#   MODELSCOPE_API_KEY=xxx ./scripts/check_modelscope_api.sh
# Optional:
#   MODEL_ID=dclef233/BaZi-Qwen3-1.7B-GGUF
#   BASE_URL=https://api-inference.modelscope.cn/v1
#   PROMPT='请用三句话解释什么是十神'

BASE_URL="${BASE_URL:-https://api-inference.modelscope.cn/v1}"
MODEL_ID="${MODEL_ID:-dclef233/BaZi-Qwen3-1.7B-GGUF}"
PROMPT="${PROMPT:-请简要解释八字中的十神概念。}"

if [[ -z "${MODELSCOPE_API_KEY:-}" ]]; then
  echo "[ERROR] MODELSCOPE_API_KEY 未设置"
  exit 1
fi

URL="${BASE_URL%/}/chat/completions"

echo "[INFO] Checking ModelScope endpoint: ${URL}"
echo "[INFO] Model: ${MODEL_ID}"

response="$(curl -sS "${URL}" \
  -H "Authorization: Bearer ${MODELSCOPE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"${MODEL_ID}\",\"messages\":[{\"role\":\"user\",\"content\":\"${PROMPT}\"}],\"stream\":false}")"

echo "[INFO] Raw response (first 800 chars):"
echo "${response}" | cut -c1-800

echo
if echo "${response}" | rg -q '"choices"'; then
  echo "[OK] ModelScope API 调用成功"
else
  echo "[WARN] 未检测到 choices 字段，请检查 token / model / endpoint"
  exit 2
fi
