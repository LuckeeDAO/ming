#!/bin/bash

# Ming 项目统一部署脚本
# - 前端发布（GitHub + Vercel）
# - EVM 合约部署（ConnectionNFT）
# - 自定义 NFT 流程检查（mintConnection staticCall）

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}════════════════════════════════════${NC}"
    echo ""
}

show_help() {
    echo -e "${CYAN}Ming 项目部署脚本${NC}"
    echo ""
    echo "使用方法:"
    echo "  ./scripts/deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  github [提交信息]                  仅提交到 GitHub"
    echo "  vercel [production|preview]        仅部署前端到 Vercel"
    echo "  backend-evm [network]              部署 Ming ConnectionNFT 合约 (sepolia/fuji/avalanche...)"
    echo "  nft-flow-check [network] [address] 检查 Ming 自定义 NFT 流程"
    echo "  all [环境] [提交信息]               完整前端流程（GitHub + Vercel）"
    echo "  help                               显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/deploy.sh backend-evm sepolia"
    echo "  ./scripts/deploy.sh nft-flow-check sepolia 0xabc..."
    echo "  ./scripts/deploy.sh all production \"feat: update UI\""
    echo ""
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

ACTION=${1:-"help"}

case "$ACTION" in
    github)
        log_section "提交到 GitHub"
        COMMIT_MSG=${2:-""}
        if [ -n "$COMMIT_MSG" ]; then
            "$SCRIPT_DIR/upload_to_github.sh" "$COMMIT_MSG"
        else
            "$SCRIPT_DIR/upload_to_github.sh"
        fi
        ;;

    vercel)
        log_section "部署前端到 Vercel"
        ENVIRONMENT=${2:-"production"}
        "$SCRIPT_DIR/deploy_vercel.sh" "$ENVIRONMENT"
        ;;

    backend-evm)
        log_section "部署 Ming 自定义 NFT 合约（EVM）"
        NETWORK=${2:-"sepolia"}
        "$SCRIPT_DIR/deploy_contract_evm.sh" "$NETWORK"
        ;;

    nft-flow-check)
        log_section "检查 Ming 自定义 NFT 释放流程"
        NETWORK=${2:-"sepolia"}
        CONTRACT_ADDRESS=${3:-""}
        if [ -n "$CONTRACT_ADDRESS" ]; then
            "$SCRIPT_DIR/check_custom_nft_flow.sh" "$NETWORK" "$CONTRACT_ADDRESS"
        else
            "$SCRIPT_DIR/check_custom_nft_flow.sh" "$NETWORK"
        fi
        ;;

    all)
        log_section "完整前端部署流程"
        ENVIRONMENT=${2:-"production"}
        COMMIT_MSG=${3:-""}
        if [ -n "$COMMIT_MSG" ]; then
            "$SCRIPT_DIR/deploy_all.sh" "$ENVIRONMENT" "$COMMIT_MSG"
        else
            "$SCRIPT_DIR/deploy_all.sh" "$ENVIRONMENT"
        fi
        ;;

    help|--help|-h)
        show_help
        ;;

    *)
        log_error "未知选项: $ACTION"
        echo ""
        show_help
        exit 1
        ;;
esac
