#!/bin/bash

# Ming 项目一键部署脚本
# 自动执行：上传到 GitHub + 部署到 Vercel
# 使用方法: ./scripts/deploy_all.sh [环境] [提交信息]

set -e  # 遇到错误时退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 参数
ENVIRONMENT=${1:-"production"}
COMMIT_MSG=${2:-""}

log_section "Ming 项目一键部署"
log_info "项目路径: $PROJECT_ROOT"
log_info "部署环境: $ENVIRONMENT"
if [ -n "$COMMIT_MSG" ]; then
    log_info "提交信息: $COMMIT_MSG"
fi

# 步骤 1: 上传到 GitHub
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

# 步骤 2: 部署到 Vercel
log_section "步骤 2: 部署到 Vercel"

"$SCRIPT_DIR/deploy_vercel.sh" "$ENVIRONMENT"

if [ $? -ne 0 ]; then
    log_error "Vercel 部署失败"
    exit 1
fi

# 完成
log_section "部署完成"
log_info "✅ 所有步骤已完成"
log_info ""
log_info "📋 部署摘要:"
log_info "   - GitHub: 代码已推送"
log_info "   - Vercel: 已部署到 $ENVIRONMENT 环境"
log_info ""
log_info "🎉 部署成功!"
