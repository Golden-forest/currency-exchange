# 货币兑换应用

一个功能强大的货币兑换和旅行辅助应用,支持中韩货币兑换、旅行记账和智能翻译功能。

## 主要功能

- **货币兑换**: 实时中韩货币兑换,支持快捷金额选择
- **旅行记账**: 便捷的旅行支出记录和统计
- **智能翻译**: 集成 DeepSeek API 的多语言翻译功能

## 移动端体验优化

本项目针对移动端进行了以下优化:

- ✅ 左右滑动切换卡片，符合移动端交互习惯
- ✅ 按钮点击动画增强，提供清晰的视觉反馈
- ✅ 手势动画优化，包括弹性回弹、边界反馈等
- ✅ 全局触摸样式优化，降低响应延迟

详细实施计划见：[移动端优化实施计划](./docs/plans/2026-02-06-mobile-experience-optimization.md)

测试清单见：[移动端优化测试清单](./docs/mobile-optimization-testing.md)

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
