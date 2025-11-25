// Cloudflare Workers函数版本的TOTP API
// 用于在Cloudflare Pages上部署

// 注意：在实际部署时，您可能需要使用npm安装otpauth，或使用CDN版本
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
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 处理并清理密钥（移除空格）
    const cleanSecret = base32.replace(/\s+/g, '');

    // 验价并解析period参数
    const period = parseInt(periodStr, 10);
    if (isNaN(period) || period < 1 || period > 300) {
      return new Response(
        JSON.stringify({
          error: 'Invalid period parameter',
          message: 'Period must be a number between 1 and 300 seconds (default: 30)'
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
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
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 验证算法参数
    const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
    const validAlgorithm = validAlgorithms.includes(algorithm.toUpperCase()) ? algorithm.toUpperCase() : 'SHA1';

    // 在Cloudflare Workers环境中，我们需要使用一个可用的库
    // 由于otpauth可能不直接在workers环境中工作，我们使用一个兼容的库
    // 这里使用一个基于webcrypto API的实现
    const OTPAuth = await import('https://cdn.skypack.dev/otpauth@9.1.4');
    
    try {
      // 创建TOTP实例
      const totp = new OTPAuth.TOTP({
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

      return new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Invalid secret key',
          message: 'The provided secret key is not a valid Base32 encoded key or is improperly formatted'
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error generating TOTP:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
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
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
          message: 'Request body must be valid JSON'
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
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
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
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
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
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
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 验证算法参数
    const validAlgorithms = ['SHA1', 'SHA256', 'SHA512'];
    const validAlgorithm = validAlgorithms.includes(algo.toUpperCase()) ? algo.toUpperCase() : 'SHA1';

    // 在Cloudflare Workers环境中，我们需要使用一个可用的库
    const OTPAuth = await import('https://cdn.skypack.dev/otpauth@9.1.4');
    
    try {
      // 创建TOTP实例
      const totp = new OTPAuth.TOTP({
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

      return new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Invalid secret key',
          message: 'The provided secret key is not a valid Base32 encoded key or is improperly formatted'
        }, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error processing POST request:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}