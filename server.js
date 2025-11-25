const express = require('express');
const path = require('path');
const OTPAuth = require('otpauth');
const app = express();
const port = process.env.PORT || 3000;

// 中间件：支持跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 中间件：解析查询参数
app.use(express.json());

// API接口：生成TOTP验证码
app.get('/totp', (req, res) => {
  try {
    // 从查询参数中获取值
    const {
      base32: secret = '',
      period: periodStr = '30',
      digits: digitsStr = '6',
      algorithm: algo = 'SHA1'
    } = req.query;

    // 验证必要参数
    if (!secret) {
      return res.status(400).json({
        error: 'Missing base32 parameter',
        message: 'Please provide a base32 encoded secret key'
      });
    }

    // 处理并清理密钥（移除空格）
    const cleanSecret = secret.replace(/\s+/g, '');

    // 验证并解析period参数
    const period = parseInt(periodStr, 10);
    if (isNaN(period) || period < 1 || period > 300) {
      return res.status(400).json({
        error: 'Invalid period parameter',
        message: 'Period must be a number between 1 and 300 seconds (default: 30)'
      });
    }

    // 验证并解析digits参数
    const digits = parseInt(digitsStr, 10);
    if (isNaN(digits) || digits < 4 || digits > 10) {
      return res.status(400).json({
        error: 'Invalid digits parameter',
        message: 'Digits must be a number between 4 and 10 (default: 6)'
      });
    }

    // 验证算法参数
    const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
    const algorithm = validAlgorithms.includes(algo.toUpperCase()) ? algo.toUpperCase() : 'SHA1';

    try {
      // 创建TOTP实例
      const totp = new OTPAuth.TOTP({
        issuer: 'TOTP API',
        label: 'User',
        algorithm: algorithm,
        digits: digits,
        period: period,
        secret: cleanSecret,
      });

      // 生成当前验证码
      const code = totp.generate();

      // 计算剩余时间
      const currentTime = Math.floor(Date.now() / 1000);
      const timeStep = Math.floor(currentTime / period);
      const secondsRemaining = period - (currentTime - timeStep * period);

      // 返回结果
      res.json({
        success: true,
        code: code,
        remaining: secondsRemaining,
        algorithm: algorithm,
        period: period,
        digits: digits,
        secret: cleanSecret,
        timestamp: currentTime
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid secret key',
        message: 'The provided secret key is not a valid Base32 encoded key or is improperly formatted'
      });
    }
  } catch (error) {
    console.error('Error generating TOTP:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// POST接口：允许通过POST请求提交数据（对于更长的密钥可能更有用）
app.post('/totp', express.json(), (req, res) => {
  try {
    // 从请求体中获取值
    const {
      base32: secret = '',
      period: periodStr = '30',
      digits: digitsStr = '6',
      algorithm: algo = 'SHA1'
    } = req.body;

    // 验证必要参数
    if (!secret) {
      return res.status(400).json({
        error: 'Missing base32 parameter',
        message: 'Please provide a base32 encoded secret key'
      });
    }

    // 处理并清理密钥（移除空格）
    const cleanSecret = secret.replace(/\s+/g, '');

    // 验证并解析period参数
    const period = parseInt(periodStr, 10);
    if (isNaN(period) || period < 1 || period > 300) {
      return res.status(400).json({
        error: 'Invalid period parameter',
        message: 'Period must be a number between 1 and 300 seconds (default: 30)'
      });
    }

    // 验证并解析digits参数
    const digits = parseInt(digitsStr, 10);
    if (isNaN(digits) || digits < 4 || digits > 10) {
      return res.status(400).json({
        error: 'Invalid digits parameter',
        message: 'Digits must be a number between 4 and 10 (default: 6)'
      });
    }

    // 验证算法参数
    const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
    const algorithm = validAlgorithms.includes(algo.toUpperCase()) ? algo.toUpperCase() : 'SHA1';

    try {
      // 创建TOTP实例
      const totp = new OTPAuth.TOTP({
        issuer: 'TOTP API',
        label: 'User',
        algorithm: algorithm,
        digits: digits,
        period: period,
        secret: cleanSecret,
      });

      // 生成当前验证码
      const code = totp.generate();

      // 计算剩余时间
      const currentTime = Math.floor(Date.now() / 1000);
      const timeStep = Math.floor(currentTime / period);
      const secondsRemaining = period - (currentTime - timeStep * period);

      // 返回结果
      res.json({
        success: true,
        code: code,
        remaining: secondsRemaining,
        algorithm: algorithm,
        period: period,
        digits: digits,
        secret: cleanSecret,
        timestamp: currentTime
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid secret key',
        message: 'The provided secret key is not a valid Base32 encoded key or is improperly formatted'
      });
    }
  } catch (error) {
    console.error('Error generating TOTP:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// 为静态文件提供服务
app.use(express.static('.'));

// 根路径返回index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API文档路径返回API使用说明
app.get('/api', (req, res) => {
  res.json({
    message: 'TOTP API Server',
    version: '1.0.0',
    usage: {
      endpoints: {
        GET: '/totp?base32=H7TC%20EYBI%20A4I4%20SXHU%20Ziyo%20P22U%20KXXY%207QVB&period=30&digits=6&algorithm=SHA1',
        POST: {
          url: '/totp',
          body: {
            base32: 'H7TC EYBI A4I4 SXHU Ziyo P22U KXXY 7QVB',
            period: 30,
            digits: 6,
            algorithm: 'SHA1'
          }
        }
      },
      parameters: {
        base32: 'Required - Base32 encoded secret key (with or without spaces)',
        period: 'Optional - Time period in seconds (default: 30, range: 1-300)',
        digits: 'Optional - Code length (default: 6, range: 4-10)',
        algorithm: 'Optional - Hash algorithm (default: SHA1, options: SHA1, SHA256, SHA512)'
      },
      example: '/totp?base32=H7TC%20EYBI%20A4I4%20SXHU%20Ziyo%20P22U%20KXXY%207QVB&period=30&digits=6&algorithm=SHA1'
    }
  });
});

app.listen(port, () => {
  console.log(`TOTP API server running at http://localhost:${port}`);
});