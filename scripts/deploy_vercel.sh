#!/bin/bash

# Ming 项目部署到 Vercel 脚本
# 使用方法: ./scripts/deploy_vercel.sh [环境] [选项]

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

# 默认配置
ENVIRONMENT=${1:-"production"}
VERCEL_PROJECT_NAME=${VERCEL_PROJECT_NAME:-"ming-platform"}
VERCEL_ORG_ID=${VERCEL_ORG_ID:-""}
VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID:-""}

log_info "🚀 开始部署 Ming 项目到 Vercel..."
log_info "项目路径: $PROJECT_ROOT"
log_info "部署环境: $ENVIRONMENT"

# 检查是否在正确的目录
if [ ! -f "srcs/package.json" ] || [ ! -f "srcs/vite.config.ts" ]; then
    log_error "❌ 错误: 请在项目根目录运行此脚本，且确保 srcs 目录存在"
    exit 1
fi

# 检查 Vercel CLI 是否安装
if ! command -v vercel &> /dev/null; then
    log_warn "Vercel CLI 未安装，正在安装..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        log_error "Vercel CLI 安装失败"
        exit 1
    fi
    log_info "Vercel CLI 安装完成"
fi

# 检查是否已登录 Vercel
log_info "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    log_warn "未登录 Vercel，请登录..."
    vercel login
    if [ $? -ne 0 ]; then
        log_error "Vercel 登录失败"
        exit 1
    fi
fi

VERCEL_USER=$(vercel whoami 2>/dev/null || echo "unknown")
log_info "当前 Vercel 用户: $VERCEL_USER"

# 进入 srcs 目录
cd srcs

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    log_info "📦 安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        log_error "依赖安装失败"
        exit 1
    fi
    log_info "依赖安装完成"
fi

# 运行构建测试
log_info "🔨 运行构建测试..."
npm run build
if [ $? -ne 0 ]; then
    log_error "构建失败，请检查代码错误"
    exit 1
fi
log_info "构建测试通过"

# 检查 vercel.json 是否存在
if [ ! -f "vercel.json" ]; then
    log_warn "vercel.json 不存在，正在创建..."
    cat > vercel.json <<EOF
{
  "version": 2,
  "name": "$VERCEL_PROJECT_NAME",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
    log_info "vercel.json 已创建"
fi

# 部署到 Vercel
log_info "🚀 开始部署到 Vercel..."

# 根据环境选择部署命令
if [ "$ENVIRONMENT" = "production" ]; then
    log_info "部署到生产环境..."
    DEPLOY_RESULT=$(vercel --prod --yes 2>&1)
elif [ "$ENVIRONMENT" = "preview" ]; then
    log_info "部署到预览环境..."
    DEPLOY_RESULT=$(vercel --yes 2>&1)
else
    log_error "未知环境: $ENVIRONMENT (支持: production, preview)"
    exit 1
fi

# 检查部署结果
if [ $? -eq 0 ]; then
    log_info "✅ 部署成功!"
    
    # 提取部署 URL
    DEPLOY_URL=$(echo "$DEPLOY_RESULT" | grep -o 'https://[^ ]*\.vercel\.app' | head -1 || echo "")
    if [ -n "$DEPLOY_URL" ]; then
        log_info ""
        log_info "🌐 部署 URL: $DEPLOY_URL"
        log_info ""
        
        # 尝试打开浏览器
        if command -v xdg-open &> /dev/null; then
            xdg-open "$DEPLOY_URL" 2>/dev/null || true
        elif command -v open &> /dev/null; then
            open "$DEPLOY_URL" 2>/dev/null || true
        fi
    fi
    
    # 显示部署信息
    log_info "📊 部署信息:"
    echo "$DEPLOY_RESULT"
    
    # 获取部署详情
    log_info ""
    log_info "📋 获取部署详情..."
    vercel ls "$VERCEL_PROJECT_NAME" 2>/dev/null || true
    
else
    log_error "部署失败"
    echo "$DEPLOY_RESULT"
    exit 1
fi

# 显示项目统计
log_info ""
log_info "📊 项目统计:"
log_info "   - 构建输出目录: dist/"
log_info "   - 构建文件数: $(find dist -type f 2>/dev/null | wc -l || echo "0")"
log_info "   - 构建大小: $(du -sh dist 2>/dev/null | cut -f1 || echo "未知")"

log_info ""
log_info "🎉 部署完成!"
log_info ""
log_info "后续步骤:"
log_info "1. 访问部署 URL 检查网站是否正常运行"
log_info "2. 检查环境变量配置（如有需要）"
log_info "3. 配置自定义域名（可选）"
log_info "4. 设置监控和告警（可选）"

# 显示 Vercel 项目链接
if [ -n "$VERCEL_PROJECT_NAME" ]; then
    log_info ""
    log_info "🔗 Vercel 项目: https://vercel.com/dashboard"
    log_info "   项目名称: $VERCEL_PROJECT_NAME"
fi
