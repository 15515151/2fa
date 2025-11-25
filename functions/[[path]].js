// Cloudflare Workers函数 - 根路径处理
// 对于Cloudflare Pages，静态文件（如index.html）通常直接从文件系统提供服务
// 这个函数将只处理API路径，不对index.html和静态资源进行重定向

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 检查请求的路径
  const path = url.pathname;

  // 只处理 /api 路径，其他路径交给静态文件服务
  if (path === '/api') {
    const apiInfo = {
      message: 'TOTP API Server on Cloudflare Workers',
      version: '1.0.0',
      usage: {
        endpoints: {
          GET: `${url.origin}/totp?base32=H7TC%20EYBI%20A4I4%20SXHU%20Ziyo%20P22U%20KXXY%207QVB&period=30&digits=6&algorithm=SHA1`,
          POST: {
            url: `${url.origin}/totp`,
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
        example: `${url.origin}/totp?base32=H7TC%20EYBI%20A4I4%20SXHU%20Ziyo%20P22U%20KXXY%207QVB&period=30&digits=6&algorithm=SHA1`
      },
      deployInfo: {
        platform: 'Cloudflare Pages with Functions',
        documentation: 'https://developers.cloudflare.com/pages/functions/'
      }
    };

    return new Response(JSON.stringify(apiInfo, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    });
  }
  else {
    // 对于其他路径，继续请求处理链，让Cloudflare Pages提供静态文件
    return await context.next();
  }
}