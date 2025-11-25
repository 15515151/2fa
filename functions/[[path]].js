// Cloudflare Workers函数 - 根路径处理
// 对于Cloudflare Pages，静态文件（如index.html）通常直接从文件系统提供服务
// 这个函数将处理除/totp之外的所有API路径

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 检查请求的路径
  const path = url.pathname;

  // 如果请求的是根路径，则重定向到index.html
  if (path === '/' || path === '/index.html') {
    // 返回一个简单的响应，指示用户访问index.html
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0; url=./index.html" />
</head>
<body>
  <p>Redirecting to <a href="./index.html">TOTP Generator</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    });
  }
  // 如果请求的是 /api 路径，返回API使用说明
  else if (path === '/api') {
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
    // 对于其他路径，重定向到index.html
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0; url=./index.html" />
</head>
<body>
  <p>Redirecting to <a href="./index.html">TOTP Generator</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    });
  }
}