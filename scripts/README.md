# Ming 项目部署脚本说明

本目录包含 Ming 项目的自动化部署脚本。

## 📋 脚本列表

### 1. `upload_to_github.sh` - 上传到 GitHub

自动提交代码并推送到 GitHub 仓库。

**使用方法：**

```bash
# 基本使用（自动生成提交信息）
./scripts/upload_to_github.sh

# 自定义提交信息
./scripts/upload_to_github.sh "feat: 添加新功能"
```

**功能：**
- ✅ 自动检查 Git 状态
- ✅ 添加所有修改的文件
- ✅ 自动生成提交信息（基于更改类型）
- ✅ 检查并设置远程仓库
- ✅ 推送到 GitHub
- ✅ 显示项目统计信息

**注意事项：**
- 首次使用需要设置远程仓库 URL
- 确保已配置 Git 用户信息
- 确保有 GitHub 仓库的推送权限

---

### 2. `deploy_vercel.sh` - 部署到 Vercel

自动构建并部署项目到 Vercel。

**使用方法：**

```bash
# 部署到生产环境
./scripts/deploy_vercel.sh production

# 部署到预览环境
./scripts/deploy_vercel.sh preview

# 默认部署到生产环境
./scripts/deploy_vercel.sh
```

**功能：**
- ✅ 检查 Vercel CLI 是否安装
- ✅ 检查 Vercel 登录状态
- ✅ 安装项目依赖
- ✅ 运行构建测试
- ✅ 创建 vercel.json 配置（如不存在）
- ✅ 部署到 Vercel
- ✅ 显示部署 URL 和统计信息

**环境变量：**
```bash
export VERCEL_PROJECT_NAME="ming-platform"
export VERCEL_ORG_ID="your-org-id"
export VERCEL_PROJECT_ID="your-project-id"
```

**前置要求：**
1. 安装 Node.js 和 npm
2. 安装 Vercel CLI: `npm install -g vercel`
3. 登录 Vercel: `vercel login`

---

## 🚀 快速开始

### 首次使用

1. **设置 Git 远程仓库：**
   ```bash
   cd /home/lc/luckee_dao/ming
   git remote add origin https://github.com/your-username/ming.git
   ```

2. **登录 Vercel：**
   ```bash
   npm install -g vercel
   vercel login
   ```

3. **运行脚本：**
   ```bash
   # 上传到 GitHub
   ./scripts/upload_to_github.sh
   
   # 部署到 Vercel
   ./scripts/deploy_vercel.sh production
   ```

---

## 📝 使用示例

### 示例 1: 完整部署流程

```bash
# 1. 上传代码到 GitHub
./scripts/upload_to_github.sh "feat: 添加NFT铸造功能"

# 2. 部署到 Vercel 预览环境
./scripts/deploy_vercel.sh preview

# 3. 测试预览环境后，部署到生产环境
./scripts/deploy_vercel.sh production
```

### 示例 2: 仅更新代码

```bash
# 只上传代码，不部署
./scripts/upload_to_github.sh "docs: 更新文档"
```

### 示例 3: 仅部署

```bash
# 只部署，不上传代码（假设代码已通过其他方式提交）
./scripts/deploy_vercel.sh production
```

---

## ⚙️ 配置说明

### Vercel 配置

项目已包含 `srcs/vercel.json` 配置文件，包含以下配置：

- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **框架**: Vite
- **路由**: SPA 路由配置
- **安全头**: XSS 防护、内容类型保护等
- **缓存策略**: 静态资源长期缓存

### 自定义配置

如需修改 Vercel 配置，编辑 `srcs/vercel.json` 文件。

---

## 🔧 故障排除

### GitHub 上传失败

1. **检查 Git 配置：**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. **检查远程仓库：**
   ```bash
   git remote -v
   ```

3. **检查权限：**
   确保有仓库的推送权限

### Vercel 部署失败

1. **检查 Vercel CLI：**
   ```bash
   vercel --version
   ```

2. **检查登录状态：**
   ```bash
   vercel whoami
   ```

3. **检查构建：**
   ```bash
   cd srcs
   npm run build
   ```

4. **查看日志：**
   ```bash
   vercel logs
   ```

---

## 📚 相关文档

- [Git 文档](https://git-scm.com/doc)
- [Vercel 文档](https://vercel.com/docs)
- [Vite 文档](https://vitejs.dev/)

---

## 🔒 安全提示

1. **不要提交敏感信息：**
   - 私钥、API 密钥等应使用环境变量
   - 使用 `.gitignore` 排除敏感文件

2. **Vercel 环境变量：**
   - 在 Vercel 控制台设置环境变量
   - 不要将环境变量提交到代码仓库

3. **Git 权限：**
   - 使用 SSH 密钥或 Personal Access Token
   - 不要将凭据硬编码到脚本中

---

## 📞 支持

如有问题，请：
1. 查看脚本输出日志
2. 检查相关文档
3. 联系项目维护者

---

**最后更新**: 2025-01-14
