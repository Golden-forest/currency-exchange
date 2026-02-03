/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 注意: PWA 配置说明
  // 项目使用 next-pwa,但 Turbopack 不支持某些 webpack 插件
  //
  // 解决方案: 使用 webpack 模式运行构建命令
  // 开发环境: npm run dev -- --webpack
  // 生产构建: npm run build -- --webpack
  //
  // 如需启用 PWA,请取消以下注释并安装 next-pwa:
  // npm install next-pwa
  //
  // const withPWA = require('next-pwa')({
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  //   disable: process.env.NODE_ENV === 'development',
  // });
  //
  // module.exports = withPWA(nextConfig);
};

module.exports = nextConfig;
