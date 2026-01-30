#!/bin/bash

# Ming 项目自动上传到 GitHub 脚本
# 使用方法: ./scripts/upload_to_github.sh [提交信息]

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

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

log_info "🚀 开始上传 Ming 项目到 GitHub..."
log_info "项目路径: $PROJECT_ROOT"

# 检查是否在正确的目录
if [ ! -f "README.md" ] || [ ! -d "srcs" ]; then
    log_error "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Git 是否初始化
if [ ! -d ".git" ]; then
    log_warn "Git 未初始化，正在初始化..."
    git init
    log_info "Git 初始化完成"
fi

# 检查是否有未提交的更改
if [ -z "$(git status --porcelain)" ]; then
    log_warn "没有未提交的更改"
    read -p "是否继续推送? (y/N): " continue_push
    if [ "$continue_push" != "y" ] && [ "$continue_push" != "Y" ]; then
        log_info "操作已取消"
        exit 0
    fi
fi

# 显示 Git 状态
log_info "📋 检查 Git 状态..."
git status

# 添加所有修改的文件
log_info "📝 添加所有修改的文件..."
git add .

# 生成提交信息
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    # 自动生成提交信息
    CHANGED_FILES=$(git diff --cached --name-only 2>/dev/null || echo "")
    if [ -z "$CHANGED_FILES" ]; then
        CHANGED_FILES=$(git diff --name-only 2>/dev/null || echo "")
    fi
    
    # 分析更改类型
    if echo "$CHANGED_FILES" | grep -q "srcs/src/components"; then
        COMMIT_TYPE="feat"
        COMMIT_SCOPE="components"
    elif echo "$CHANGED_FILES" | grep -q "srcs/src/pages"; then
        COMMIT_TYPE="feat"
        COMMIT_SCOPE="pages"
    elif echo "$CHANGED_FILES" | grep -q "srcs/src/services"; then
        COMMIT_TYPE="feat"
        COMMIT_SCOPE="services"
    elif echo "$CHANGED_FILES" | grep -q "docs"; then
        COMMIT_TYPE="docs"
        COMMIT_SCOPE="documentation"
    elif echo "$CHANGED_FILES" | grep -q "scripts"; then
        COMMIT_TYPE="chore"
        COMMIT_SCOPE="scripts"
    else
        COMMIT_TYPE="chore"
        COMMIT_SCOPE="project"
    fi
    
    # 生成提交信息
    COMMIT_MSG="$COMMIT_TYPE($COMMIT_SCOPE): 更新项目文件
    
- 自动提交所有更改
- 更新时间: $(date '+%Y-%m-%d %H:%M:%S')
- 更改文件数: $(echo "$CHANGED_FILES" | wc -l)"
fi

# 提交更改
log_info "💾 提交更改..."
log_debug "提交信息: $COMMIT_MSG"
git commit -m "$COMMIT_MSG" || {
    log_warn "提交失败，可能没有更改需要提交"
    exit 0
}

# 检查远程仓库设置
log_info "🔗 检查远程仓库设置..."
if ! git remote | grep -q "origin"; then
    log_warn "未设置远程仓库 origin"
    read -p "请输入 GitHub 仓库 URL (例如: https://github.com/username/ming.git): " REPO_URL
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        log_info "已添加远程仓库: $REPO_URL"
    else
        log_error "未提供仓库 URL，无法推送"
        exit 1
    fi
fi

# 显示远程仓库信息
git remote -v

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current || echo "main")
log_info "当前分支: $CURRENT_BRANCH"

# 推送代码到 GitHub
log_info "⬆️  推送代码到 GitHub..."
if git push -u origin "$CURRENT_BRANCH" 2>&1; then
    log_info "✅ 项目已成功上传到 GitHub!"
else
    log_error "推送失败，请检查网络连接和权限"
    exit 1
fi

# 显示项目统计信息
log_info ""
log_info "📊 项目统计:"
log_info "   - 总文件数: $(find . -type f -not -path './.git/*' -not -path './node_modules/*' | wc -l)"
log_info "   - TypeScript 文件: $(find . -name "*.ts" -not -path './node_modules/*' | wc -l)"
log_info "   - TypeScript React 文件: $(find . -name "*.tsx" -not -path './node_modules/*' | wc -l)"
log_info "   - 文档文件: $(find . -name "*.md" -not -path './node_modules/*' | wc -l)"
log_info "   - 脚本文件: $(find . -name "*.sh" -not -path './node_modules/*' | wc -l)"

# 显示代码行数统计
if command -v cloc &> /dev/null; then
    log_info ""
    log_info "📈 代码统计 (使用 cloc):"
    cloc srcs/src --exclude-dir=node_modules,dist,build 2>/dev/null || true
elif command -v find &> /dev/null; then
    TS_LINES=$(find srcs/src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
    log_info "   - TypeScript 代码行数: $TS_LINES"
fi

log_info ""
log_info "🎉 上传完成! 您现在可以访问 GitHub 仓库查看您的项目"
log_info "📋 本次提交包含:"
log_info "   - 所有项目文件更新"
log_info "   - 文档更新"
log_info "   - 脚本文件更新"

# 显示 GitHub 仓库链接
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -n "$REPO_URL" ]; then
    # 转换 SSH URL 为 HTTPS URL
    if [[ "$REPO_URL" == git@* ]]; then
        REPO_URL=$(echo "$REPO_URL" | sed 's/git@\(.*\):\(.*\)\.git/https:\/\/\1\/\2/g')
    fi
    # 移除 .git 后缀
    REPO_URL=$(echo "$REPO_URL" | sed 's/\.git$//')
    log_info ""
    log_info "🔗 GitHub 仓库: $REPO_URL"
    log_info "   分支: $CURRENT_BRANCH"
fi
