// 简单的测试脚本，用于验证API功能
// 这个脚本不是部署的一部分，仅用于本地测试验证

console.log("TOTP API 测试");
console.log("================");

// 测试数据
const testData = {
  base32: "H7TC EYBI A4I4 SXHU Ziyo P22U KXXY 7QVB", // 包含空格的密钥
  period: 30,
  digits: 6,
  algorithm: "SHA1"
};

console.log("测试数据:");
console.log("- 密钥 (含空格):", testData.base32);
console.log("- 时效:", testData.period, "秒");
console.log("- 长度:", testData.digits);
console.log("- 算法:", testData.algorithm);

// 模拟清理空格的过程
const cleanSecret = testData.base32.replace(/\s+/g, '');
console.log("\n处理后:");
console.log("- 清理空格后的密钥:", cleanSecret);

console.log("\nAPI调用示例:");
console.log("GET /totp?base32=H7TC%20EYBI%20A4I4%20SXHU%20Ziyo%20P22U%20KXXY%207QVB&period=30&digits=6&algorithm=SHA1");

console.log("\n预期响应格式:");
console.log(`{
  "success": true,
  "code": "验证码(6位数字)",
  "remaining": "剩余秒数(0-30)",
  "algorithm": "SHA1",
  "period": 30,
  "digits": 6,
  "secret": "H7TCEYBIA4I4SXHUZiyoP22UKXXY7QVB",
  "timestamp": "当前时间戳"
}`);

console.log("\n部署到Cloudflare Pages后，API将在以下URL可用:");
console.log("https://your-project-name.pages.dev/totp");

console.log("\n注意: 在实际部署中，/functions/totp.js 文件将作为无服务器函数运行");