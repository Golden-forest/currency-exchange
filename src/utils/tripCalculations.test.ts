/**
 * 旅行账本计算工具函数测试示例
 * 这是一个简单的测试文件，用于验证计算逻辑
 */

import {
  calculateSettlement,
  groupTransactionsByDate,
  calculateTotalSpent,
  calculatePersonalSpent,
  calculatePersonalShare,
  convertKRWToCNY,
  convertCNYToKRW,
} from './tripCalculations';
import type { Transaction } from '../types/trip';
import { generateTransactionId } from './idGenerator';

// 测试数据
const travelers = ['小明', '小红', '小刚'];
const rate = 190; // 1 CNY = 190 KRW

const mockTransactions: Transaction[] = [
  {
    id: generateTransactionId(),
    name: '便利店',
    amountKRW: 19000,
    amountCNY: 100,
    payer: '小明',
    splitType: 'even',
    splitAmong: ['小明', '小红', '小刚'],
    timestamp: Date.now(),
    icon: '🏪',
    date: '2026-02-05',
  },
  {
    id: generateTransactionId(),
    name: '餐厅',
    amountKRW: 57000,
    amountCNY: 300,
    payer: '小红',
    splitType: 'treat',
    treatedBy: '小红',
    timestamp: Date.now(),
    icon: '🍜',
    date: '2026-02-05',
  },
  {
    id: generateTransactionId(),
    name: '咖啡店',
    amountKRW: 9500,
    amountCNY: 50,
    payer: '小刚',
    splitType: 'none',
    timestamp: Date.now(),
    icon: '☕',
    date: '2026-02-04',
  },
];

// 测试函数
function runTests() {
  console.log('=== 旅行账本计算测试 ===\n');

  // 测试1: 计算算账报告
  console.log('1. 算账报告测试:');
  const settlement = calculateSettlement(mockTransactions, travelers);
  settlement.forEach((item) => {
    console.log(`${item.traveler}:`);
    console.log(`  已付: ¥${item.totalPaid.toFixed(2)}`);
    console.log(`  应付: ¥${item.totalShare.toFixed(2)}`);
    console.log(`  净额: ¥${item.balance.toFixed(2)}`);
    console.log(`  说明: ${item.balance > 0 ? '应该付钱' : item.balance < 0 ? '应该收钱' : '已结清'}`);
    console.log('');
  });

  // 测试2: 按日期分组
  console.log('2. 按日期分组测试:');
  const grouped = groupTransactionsByDate(mockTransactions);
  grouped.forEach((group) => {
    console.log(`${group.date}:`);
    console.log(`  交易数: ${group.transactions.length}`);
    console.log(`  总金额: ¥${group.totalAmount.toFixed(2)}`);
    console.log('');
  });

  // 测试3: 计算总支出
  console.log('3. 总支出测试:');
  const total = calculateTotalSpent(mockTransactions);
  console.log(`总支出: ¥${total.toFixed(2)}\n`);

  // 测试4: 个人支出
  console.log('4. 个人支出测试:');
  travelers.forEach((traveler) => {
    const spent = calculatePersonalSpent(mockTransactions, traveler);
    console.log(`${traveler} 支付了: ¥${spent.toFixed(2)}`);
  });
  console.log('');

  // 测试5: 个人应承担费用
  console.log('5. 个人应承担费用测试:');
  travelers.forEach((traveler) => {
    const share = calculatePersonalShare(mockTransactions, traveler);
    console.log(`${traveler} 应承担: ¥${share.toFixed(2)}`);
  });
  console.log('');

  // 测试6: 货币转换
  console.log('6. 货币转换测试:');
  console.log(`1000 KRW = ¥${convertKRWToCNY(1000, rate).toFixed(2)} CNY`);
  console.log(`¥100 CNY = ${convertCNYToKRW(100, rate).toFixed(0)} KRW`);
}

// 运行测试（在实际使用中，这应该在测试框架中运行）
// runTests();
