import React from 'react';

/**
 * 旅行者头像组件
 * 显示旅行者头像,取每个旅行者姓名的最后一个字
 * 使用4种预设背景色循环显示
 */
type Props = {
  travelers: string[];
}

// 预设背景色
const COLORS = ['#FF6B81', '#4ECDC4', '#FFE66D', '#95E1D3'];

export function TravelerAvatars({ travelers }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {travelers.map((traveler, index) => {
        // 获取旅行者姓名的最后一个字
        const lastChar = traveler.slice(-1);
        // 循环使用颜色
        const color = COLORS[index % COLORS.length];

        return (
          <div
            key={traveler}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ backgroundColor: color }}
            title={traveler} // 鼠标悬停时显示完整姓名
          >
            {lastChar}
          </div>
        );
      })}
    </div>
  );
}
