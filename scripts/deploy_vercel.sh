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
VERCEL_PROJECT_NAME=${VERCEL_PROJECT_NAME:-"ming"}
VERCEL_ORG_ID=${VERCEL_ORG_ID:-""}
VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID:-""}
# 非交互部署支持：
# - VERCEL_TOKEN: Vercel Personal Token（推荐在 CI / 自动化场景使用）
# - VERCEL_SCOPE: Team slug（可选；如需指定团队/组织）
# - VERCEL_CUSTOM_DOMAIN: 自定义域名（可选；此项目默认 ming.cdao.online）
VERCEL_TOKEN=${VERCEL_TOKEN:-""}
VERCEL_SCOPE=${VERCEL_SCOPE:-""}
VERCEL_CUSTOM_DOMAIN=${VERCEL_CUSTOM_DOMAIN:-"ming.cdao.online"}

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
VERCEL_WHOAMI_ARGS=()
if [ -n "$VERCEL_TOKEN" ]; then
    VERCEL_WHOAMI_ARGS+=(--token "$VERCEL_TOKEN")
fi
if [ -n "$VERCEL_SCOPE" ]; then
    VERCEL_WHOAMI_ARGS+=(--scope "$VERCEL_SCOPE")
fi

if ! vercel whoami "${VERCEL_WHOAMI_ARGS[@]}" &> /dev/null; then
    if [ -n "$VERCEL_TOKEN" ]; then
        log_error "❌ Vercel Token 无法通过校验（vercel whoami 失败）。请检查 VERCEL_TOKEN 是否正确、是否有权限访问对应 Team/Project。"
        exit 1
    fi
    log_warn "未登录 Vercel，且未提供 VERCEL_TOKEN，将进入交互式登录..."
    vercel login
    if [ $? -ne 0 ]; then
        log_error "Vercel 登录失败"
        exit 1
    fi
fi

VERCEL_USER=$(vercel whoami "${VERCEL_WHOAMI_ARGS[@]}" 2>/dev/null || echo "unknown")
log_info "当前 Vercel 用户: $VERCEL_USER"

# 进入 srcs 目录
cd srcs

# 检查并确保项目关联正确
log_info "🔗 检查项目关联..."
if [ -f ".vercel/project.json" ]; then
    CURRENT_PROJECT=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
    if [ "$CURRENT_PROJECT" != "$VERCEL_PROJECT_NAME" ]; then
        log_warn "当前关联的项目 ($CURRENT_PROJECT) 与目标项目 ($VERCEL_PROJECT_NAME) 不一致"
        log_info "正在切换到正确的项目: $VERCEL_PROJECT_NAME"
        vercel link --project="$VERCEL_PROJECT_NAME" "${VERCEL_LINK_ARGS[@]}" --yes 2>&1 || {
            log_error "无法关联到项目 $VERCEL_PROJECT_NAME，请检查项目是否存在"
            exit 1
        }
        log_info "✅ 项目关联已更新"
    else
        log_info "✅ 项目关联正确: $CURRENT_PROJECT"
    fi
else
    log_warn ".vercel 目录不存在，正在关联项目: $VERCEL_PROJECT_NAME"
    vercel link --project="$VERCEL_PROJECT_NAME" --yes "${VERCEL_CLI_ARGS[@]}" 2>&1 || {
        log_error "无法关联到项目 $VERCEL_PROJECT_NAME，请检查项目是否存在"
        exit 1
    }
    log_info "✅ 项目已关联"
fi

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

# 统一的 Vercel CLI 参数（用于非交互/指定 scope）
# 注意：vercel link 和 vercel deploy 的参数可能不同，这里只用于部署
VERCEL_DEPLOY_ARGS=(--yes)
if [ -n "$VERCEL_TOKEN" ]; then
    VERCEL_DEPLOY_ARGS+=(--token "$VERCEL_TOKEN")
fi
if [ -n "$VERCEL_SCOPE" ]; then
    VERCEL_DEPLOY_ARGS+=(--scope "$VERCEL_SCOPE")
fi

# 用于 link 命令的参数（不使用 --yes）
VERCEL_LINK_ARGS=()
if [ -n "$VERCEL_TOKEN" ]; then
    VERCEL_LINK_ARGS+=(--token "$VERCEL_TOKEN")
fi
if [ -n "$VERCEL_SCOPE" ]; then
    VERCEL_LINK_ARGS+=(--scope "$VERCEL_SCOPE")
fi

# 根据环境选择部署命令
if [ "$ENVIRONMENT" = "production" ]; then
    log_info "部署到生产环境..."
    DEPLOY_RESULT=$(vercel --prod "${VERCEL_DEPLOY_ARGS[@]}" 2>&1)
elif [ "$ENVIRONMENT" = "preview" ]; then
    log_info "部署到预览环境..."
    DEPLOY_RESULT=$(vercel "${VERCEL_DEPLOY_ARGS[@]}" 2>&1)
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
    
    # 可选：绑定自定义域名到本次部署（生产环境建议）
    if [ "$ENVIRONMENT" = "production" ] && [ -n "$VERCEL_CUSTOM_DOMAIN" ] && [ -n "$DEPLOY_URL" ]; then
        log_info ""
        log_info "🌍 尝试绑定自定义域名: $VERCEL_CUSTOM_DOMAIN"

        # 1) 确保域名在账户中（若已存在会失败，但不影响后续）
        vercel domains add "$VERCEL_CUSTOM_DOMAIN" "${VERCEL_DEPLOY_ARGS[@]}" 2>/dev/null || true

        # 2) 将本次部署 alias 到自定义域名
        # 说明：若域名未验证/DNS 未配置，会返回错误；脚本不强制失败，方便先拿到部署 URL。
        # 注意：域名通常已在 Vercel 控制台配置，会自动关联到生产部署，这里只是尝试手动关联
        # vercel alias 命令不支持 --yes，所以移除它
        VERCEL_ALIAS_ARGS=()
        if [ -n "$VERCEL_TOKEN" ]; then
            VERCEL_ALIAS_ARGS+=(--token "$VERCEL_TOKEN")
        fi
        if [ -n "$VERCEL_SCOPE" ]; then
            VERCEL_ALIAS_ARGS+=(--scope "$VERCEL_SCOPE")
        fi
        if vercel alias set "$DEPLOY_URL" "$VERCEL_CUSTOM_DOMAIN" "${VERCEL_ALIAS_ARGS[@]}" 2>&1; then
            log_info "✅ 域名绑定完成: https://$VERCEL_CUSTOM_DOMAIN"
        else
            log_warn "⚠️ 域名绑定未完成（可能需要在 DNS 配置/验证域名，或权限不足）。"
            log_warn "   你可以在 Vercel 控制台为项目添加域名并按提示配置 DNS：$VERCEL_CUSTOM_DOMAIN"
        fi
    fi

    # 获取部署详情
    log_info ""
    log_info "📋 获取部署详情..."
    vercel ls "$VERCEL_PROJECT_NAME" "${VERCEL_DEPLOY_ARGS[@]}" 2>/dev/null || true
    
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
