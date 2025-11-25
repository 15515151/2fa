# 部署到 Cloudflare Pages

本项目包含一个 TOTP API，可以在 Cloudflare Pages 上部署为无服务器函数。

## 部署步骤

### 1. 准备工作

1. 注册 [Cloudflare](https://dash.cloudflare.com/) 账户
2. 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/):
   ```bash
   npm install -g wrangler
   ```

### 2. 配置项目

1. 在项目根目录下找到 `wrangler.toml` 文件
2. 将 `account_id` 替换为你的 Cloudflare 账户 ID
   - 可以在 Cloudflare 仪表板的 "Overview" 页面找到账户 ID

### 3. 部署到 Cloudflare Pages

1. 登录到 Wrangler:
   ```bash
   wrangler login
   ```

2. 在 Cloudflare 仪表板中创建一个新的 Pages 项目

3. 连接你的 GitHub/GitLab 等代码仓库，或使用以下命令部署:
   ```bash
   # 构建并部署
   wrangler pages deploy ./ --project-name=your-project-name
   ```

### 4. 部署选项

#### 选项 1: 通过 Cloudflare Pages 仪表板 (推荐)

1. 进入 Cloudflare 仪表板 → Pages
2. 点击 "Create a project"
3. 连接你的 Git 仓库
4. 在 "Build configurations" 中设置:
   - Build command: `echo "No build needed for static site"` (或留空)
   - Build output directory: `./` (或项目根目录)
   - Root directory: `./`

5. 部署项目

#### 选项 2: 使用 Wrangler CLI

```bash
wrangler pages project create totp-api
wrangler pages deploy ./ --project-name=totp-api
```

## API 使用方法

### GET 请求

```
https://your-project-name.pages.dev/totp?base32=H7TC%20EYBI%20A4I4%20SXHU%20Ziyo%20P22U%20KXXY%207QVB&period=30&digits=6&algorithm=SHA1
```

### POST 请求

```json
{
  "base32": "H7TC EYBI A4I4 SXHU Ziyo P22U KXXY 7QVB",
  "period": 30,
  "digits": 6,
  "algorithm": "SHA1"
}
```

### 参数说明

- `base32` (必需): Base32 编码的密钥 (可包含空格，API 会自动移除)
- `period` (可选): 时间周期，单位秒 (默认: 30, 范围: 1-300)
- `digits` (可选): 验证码长度 (默认: 6, 范围: 4-10)
- `algorithm` (可选): 哈希算法 (默认: SHA1, 可选: SHA1, SHA256, SHA512)

## 返回结果

```json
{
  "success": true,
  "code": "123456",
  "remaining": 23,
  "algorithm": "SHA1",
  "period": 30,
  "digits": 6,
  "secret": "H7TCEYBIA4I4SXHUZiyoP22UKXXY7QVB",
  "timestamp": 1698765432
}
```

## 本地开发

使用 Wrangler 进行本地开发和测试:

```bash
# 本地运行
wrangler pages dev

# 或者指定端口
wrangler pages dev --port 8788
```

## 项目结构

```
/
├── index.html          # 主页面 (前端TOTP生成器)
├── totp_api.html       # (可选) 纯前端API模拟
├── functions/          # Cloudflare Pages Functions
│   ├── totp.js         # TOTP API 函数
│   └── [[path]].js     # 根路径处理函数
├── server.js           # (可选) Node.js 服务器版本
├── package.json        # 依赖和脚本
├── wrangler.toml       # Cloudflare 配置
└── DEPLOYMENT.md       # 部署说明
```

## 注意事项

1. Cloudflare Workers/Functions 中的依赖需要通过 CDN 导入，如 `import()` 语句
2. 请确保在生产环境中使用 HTTPS
3. API 没有速率限制，如需要可添加额外的安全措施
4. 密钥通过 URL 参数传输，请注意安全性，避免在日志中暴露