#!/bin/bash

# Ming 项目快速部署脚本
# 统一入口：提交到 GitHub 和部署到 Vercel
# 使用方法: ./scripts/deploy.sh [选项]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
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

# 显示帮助信息
show_help() {
    echo -e "${CYAN}Ming 项目部署脚本${NC}"
    echo ""
    echo "使用方法:"
    echo "  ./scripts/deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  github [提交信息]    仅提交到 GitHub"
    echo "  vercel [环境]        仅部署到 Vercel (环境: production/preview)"
    echo "  all [环境] [提交信息] 完整流程：GitHub + Vercel"
    echo "  help                 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/deploy.sh github \"feat: 添加新功能\""
    echo "  ./scripts/deploy.sh vercel production"
    echo "  ./scripts/deploy.sh all production \"feat: 更新功能\""
    echo ""
}

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 解析参数
ACTION=${1:-"help"}

case "$ACTION" in
    github)
        log_section "🚀 提交到 GitHub"
        COMMIT_MSG=${2:-""}
        if [ -n "$COMMIT_MSG" ]; then
            "$SCRIPT_DIR/upload_to_github.sh" "$COMMIT_MSG"
        else
            "$SCRIPT_DIR/upload_to_github.sh"
        fi
        ;;
    
    vercel)
        log_section "🚀 部署到 Vercel"
        ENVIRONMENT=${2:-"production"}
        "$SCRIPT_DIR/deploy_vercel.sh" "$ENVIRONMENT"
        ;;
    
    all)
        log_section "🚀 完整部署流程"
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
