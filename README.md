# 2fa
在线TOTP/2FA验证码生成器

## 功能特性

- 🕐 实时生成TOTP验证码
- 🧩 自动处理密钥中的空格
- ⚙️ 支持自定义参数 (算法、时效、长度)
- 🌐 提供API接口

## API 接口

提供一个 RESTful API 接口用于生成TOTP验证码：

### GET /totp

```
GET /totp?base32=H7TC%20EYBI%20A4I4%20SXHU%20Ziyo%20P22U%20KXXY%207QVB&period=30&digits=6&algorithm=SHA1
```

#### 参数

- `base32` (必需): Base32 编码的密钥 (自动处理空格)
- `period` (可选): 时间周期，单位秒 (默认: 30, 范围: 1-300)
- `digits` (可选): 验证码长度 (默认: 6, 范围: 4-10)
- `algorithm` (可选): 哈希算法 (默认: SHA1, 可选: SHA1, SHA256, SHA512)

#### 响应

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

### POST /totp

除了GET请求，也支持POST请求：

```json
{
  "base32": "H7TC EYBI A4I4 SXHU Ziyo P22U KXXY 7QVB",
  "period": 30,
  "digits": 6,
  "algorithm": "SHA1"
}
```

## 部署

可以部署到 Cloudflare Pages，详情请参考 [DEPLOYMENT.md](DEPLOYMENT.md)

## 本地开发

```bash
# 安装依赖
npm install

# 运行本地服务器
node server.js
```
