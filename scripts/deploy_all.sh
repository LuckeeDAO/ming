#!/bin/bash

# Ming 项目一键部署脚本
# 默认：上传 GitHub + 部署 Vercel
# 可选：先部署 EVM 合约并检查自定义 NFT 流程

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

ENVIRONMENT=${1:-"production"}
COMMIT_MSG=${2:-""}

# 可选后端步骤（默认关闭）
MING_DEPLOY_BACKEND_EVM=${MING_DEPLOY_BACKEND_EVM:-false}
MING_BACKEND_NETWORK=${MING_BACKEND_NETWORK:-sepolia}
MING_RUN_NFT_FLOW_CHECK=${MING_RUN_NFT_FLOW_CHECK:-false}
MING_CONTRACT_ADDRESS=${MING_CONTRACT_ADDRESS:-}

log_section "Ming 项目一键部署"
log_info "项目路径: $PROJECT_ROOT"
log_info "部署环境: $ENVIRONMENT"
log_info "后端EVM部署: $MING_DEPLOY_BACKEND_EVM"
log_info "后端网络: $MING_BACKEND_NETWORK"
log_info "NFT流程检查: $MING_RUN_NFT_FLOW_CHECK"
if [ -n "$COMMIT_MSG" ]; then
    log_info "提交信息: $COMMIT_MSG"
fi

if [ "$MING_DEPLOY_BACKEND_EVM" = "true" ]; then
    log_section "步骤 0: 部署 Ming 自定义 NFT 合约（EVM）"
    "$SCRIPT_DIR/deploy_contract_evm.sh" "$MING_BACKEND_NETWORK"

    if [ "$MING_RUN_NFT_FLOW_CHECK" = "true" ]; then
        log_section "步骤 0.1: 检查 Ming 自定义 NFT 流程"
        if [ -n "$MING_CONTRACT_ADDRESS" ]; then
            "$SCRIPT_DIR/check_custom_nft_flow.sh" "$MING_BACKEND_NETWORK" "$MING_CONTRACT_ADDRESS"
        else
            "$SCRIPT_DIR/check_custom_nft_flow.sh" "$MING_BACKEND_NETWORK"
        fi
    fi
fi

log_section "步骤 1: 上传到 GitHub"
if [ -n "$COMMIT_MSG" ]; then
    "$SCRIPT_DIR/upload_to_github.sh" "$COMMIT_MSG"
else
    "$SCRIPT_DIR/upload_to_github.sh"
fi

if [ $? -ne 0 ]; then
    log_error "GitHub 上传失败"
    read -p "是否继续部署到 Vercel? (y/N): " continue_deploy
    if [ "$continue_deploy" != "y" ] && [ "$continue_deploy" != "Y" ]; then
        log_info "部署已取消"
        exit 1
    fi
fi

log_section "步骤 2: 部署到 Vercel"
"$SCRIPT_DIR/deploy_vercel.sh" "$ENVIRONMENT"

if [ $? -ne 0 ]; then
    log_error "Vercel 部署失败"
    exit 1
fi

log_section "部署完成"
log_info "✅ 所有步骤已完成"
log_info "📋 部署摘要:"
if [ "$MING_DEPLOY_BACKEND_EVM" = "true" ]; then
    log_info "   - EVM 合约: 已执行部署 ($MING_BACKEND_NETWORK)"
    if [ "$MING_RUN_NFT_FLOW_CHECK" = "true" ]; then
        log_info "   - 自定义 NFT 流程: 已执行检查"
    fi
fi
log_info "   - GitHub: 代码已推送"
log_info "   - Vercel: 已部署到 $ENVIRONMENT 环境"
