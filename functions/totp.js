// Cloudflare Workers函数版本的TOTP API
// 用于在Cloudflare Pages上部署

// 为兼容Cloudflare Workers环境，使用一个简化版本的TOTP实现
// 依赖内置的加密函数和js-sha1库（通过CDN引入）

// 尝试使用 Cloudflare Workers 内置的加密功能
export async function onRequestGet(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);

    // 从查询参数中获取值
    const base32 = url.searchParams.get('base32');
    const periodStr = url.searchParams.get('period') || '30';
    const digitsStr = url.searchParams.get('digits') || '6';
    const algorithm = url.searchParams.get('algorithm') || 'SHA1';

    // 验证必要参数
    if (!base32) {
      return new Response(
        JSON.stringify({
          error: 'Missing base32 parameter',
          message: 'Please provide a base32 encoded secret key'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }

    // 处理并清理密钥（移除空格）
    const cleanSecret = base32.replace(/\s+/g, '');

    // 验证并解析period参数
    const period = parseInt(periodStr, 10);
    if (isNaN(period) || period < 1 || period > 300) {
      return new Response(
        JSON.stringify({
          error: 'Invalid period parameter',
          message: 'Period must be a number between 1 and 300 seconds (default: 30)'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }

    // 验证并解析digits参数
    const digits = parseInt(digitsStr, 10);
    if (isNaN(digits) || digits < 4 || digits > 10) {
      return new Response(
        JSON.stringify({
          error: 'Invalid digits parameter',
          message: 'Digits must be a number between 4 and 10 (default: 6)'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }

    // 验证算法参数
    const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
    const validAlgorithm = validAlgorithms.includes(algorithm.toUpperCase()) ? algorithm.toUpperCase() : 'SHA1';

    try {
      // 动态导入otpauth库
      const { TOTP } = await import('https://cdn.skypack.dev/otpauth@9.1.4');

      // 创建TOTP实例
      const totp = new TOTP({
        issuer: 'TOTP API',
        label: 'User',
        algorithm: validAlgorithm,
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
      const result = {
        success: true,
        code: code,
        remaining: secondsRemaining,
        algorithm: validAlgorithm,
        period: period,
        digits: digits,
        secret: cleanSecret,
        timestamp: currentTime
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      });
    } catch (error) {
      console.error('TOTP generation error:', error);
      return new Response(
        JSON.stringify({
          error: 'Invalid secret key',
          message: 'The provided secret key is not a valid Base32 encoded key or is improperly formatted'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error generating TOTP:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      }
    );
  }
}

// 处理POST请求
export async function onRequestPost(context) {
  try {
    const { request } = context;

    let body;
    try {
      // 解析请求体为文本，然后解析JSON
      const bodyText = await request.text();
      body = JSON.parse(bodyText);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
          message: 'Request body must be valid JSON'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }

    // 从请求体中获取值
    const {
      base32: secret = '',
      period: periodStr = '30',
      digits: digitsStr = '6',
      algorithm: algo = 'SHA1'
    } = body;

    // 验证必要参数
    if (!secret) {
      return new Response(
        JSON.stringify({
          error: 'Missing base32 parameter',
          message: 'Please provide a base32 encoded secret key'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }

    // 处理并清理密钥（移除空格）
    const cleanSecret = secret.replace(/\s+/g, '');

    // 验证并解析period参数
    const period = parseInt(periodStr, 10);
    if (isNaN(period) || period < 1 || period > 300) {
      return new Response(
        JSON.stringify({
          error: 'Invalid period parameter',
          message: 'Period must be a number between 1 and 300 seconds (default: 30)'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }

    // 验证并解析digits参数
    const digits = parseInt(digitsStr, 10);
    if (isNaN(digits) || digits < 4 || digits > 10) {
      return new Response(
        JSON.stringify({
          error: 'Invalid digits parameter',
          message: 'Digits must be a number between 4 and 10 (default: 6)'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }

    // 验证算法参数
    const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
    const validAlgorithm = validAlgorithms.includes(algo.toUpperCase()) ? algo.toUpperCase() : 'SHA1';

    try {
      // 动态导入otpauth库
      const { TOTP } = await import('https://cdn.skypack.dev/otpauth@9.1.4');

      // 创建TOTP实例
      const totp = new TOTP({
        issuer: 'TOTP API',
        label: 'User',
        algorithm: validAlgorithm,
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
      const result = {
        success: true,
        code: code,
        remaining: secondsRemaining,
        algorithm: validAlgorithm,
        period: period,
        digits: digits,
        secret: cleanSecret,
        timestamp: currentTime
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      });
    } catch (error) {
      console.error('TOTP generation error:', error);
      return new Response(
        JSON.stringify({
          error: 'Invalid secret key',
          message: 'The provided secret key is not a valid Base32 encoded key or is improperly formatted'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error processing POST request:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      }
    );
  }
}