/**
 * 旅行账本计算工具函数
 */

import type { Transaction, SettlementItem, TransactionsByDate } from '../types/trip';

// 头像颜色配置
const COLORS = ['#FF6B81', '#4ECDC4', '#FFE66D', '#95E1D3', '#A8E6CF', '#FFD93D'];

/**
 * 计算算账报告 - 每个人的净额
 * @param transactions 交易记录列表
 * @param travelers 旅行者列表
 * @returns 算账报告
 */
export function calculateSettlement(
  transactions: Transaction[],
  travelers: string[]
): SettlementItem[] {
  // 初始化报告
  const report = travelers.map((traveler) => ({
    traveler,
    totalPaid: 0,
    totalShare: 0,
    balance: 0,
    color: COLORS[travelers.indexOf(traveler) % COLORS.length],
  }));

  // 遍历所有交易
  transactions.forEach((transaction) => {
    // 找到付款人在报告中的索引
    const payerIndex = travelers.indexOf(transaction.payer);

    if (payerIndex === -1) {
      console.warn(`付款人 "${transaction.payer}" 不在旅行者列表中`);
      return;
    }

    // 累加已付金额
    report[payerIndex].totalPaid += transaction.amountCNY;

    // 根据分摊类型计算应该承担的费用
    if (transaction.splitType === 'even' && transaction.splitAmong) {
      // 平均分摊模式
      const sharePerPerson = transaction.amountCNY / transaction.splitAmong.length;
      transaction.splitAmong.forEach((person) => {
        const index = travelers.indexOf(person);
        if (index !== -1) {
          report[index].totalShare += sharePerPerson;
        }
      });
    } else if (transaction.splitType === 'treat' && transaction.treatedBy) {
      // 请客模式：请客的人承担全部费用
      const treaterIndex = travelers.indexOf(transaction.treatedBy);
      if (treaterIndex !== -1) {
        report[treaterIndex].totalShare += transaction.amountCNY;
      }
    } else if (transaction.splitType === 'none') {
      // 不分摊模式：付款人自己承担
      report[payerIndex].totalShare += transaction.amountCNY;
    }
  });

  // 计算净额(应付 - 已付)
  // balance > 0: 应该付钱
  // balance < 0: 应该收钱
  // balance ≈ 0: 已经结清
  report.forEach((item) => {
    item.balance = item.totalShare - item.totalPaid;
  });

  return report;
}

/**
 * 按日期分组交易记录
 * @param transactions 交易记录列表
 * @returns 按日期分组的交易记录
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): TransactionsByDate[] {
  // 按日期分组
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach((transaction) => {
    const date = transaction.date;
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(transaction);
  });

  // 转换为数组并计算每日总金额
  const result: TransactionsByDate[] = Array.from(grouped.entries())
    .map(([date, transactions]) => ({
      date,
      transactions,
      totalAmount: transactions.reduce((sum, t) => sum + t.amountCNY, 0),
    }))
    .sort((a, b) => {
      // 按日期降序排列（最新的在前）
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return result;
}

/**
 * 计算总支出
 * @param transactions 交易记录列表
 * @returns 总金额(CNY)
 */
export function calculateTotalSpent(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => {
    return total + transaction.amountCNY;
  }, 0);
}

/**
 * 计算某个人的总支出
 * @param transactions 交易记录列表
 * @param traveler 旅行者姓名
 * @returns 该人的总支出(CNY)
 */
export function calculatePersonalSpent(
  transactions: Transaction[],
  traveler: string
): number {
  return transactions
    .filter((t) => t.payer === traveler)
    .reduce((total, t) => total + t.amountCNY, 0);
}

/**
 * 计算某个人的应该承担的费用
 * @param transactions 交易记录列表
 * @param traveler 旅行者姓名
 * @returns 该人应该承担的费用(CNY)
 */
export function calculatePersonalShare(
  transactions: Transaction[],
  traveler: string
): number {
  let share = 0;

  transactions.forEach((transaction) => {
    if (transaction.splitType === 'even' && transaction.splitAmong) {
      // 平均分摊：如果在参与列表中，承担一份
      if (transaction.splitAmong.includes(traveler)) {
        share += transaction.amountCNY / transaction.splitAmong.length;
      }
    } else if (transaction.splitType === 'treat' && transaction.treatedBy) {
      // 请客模式：如果是请客的人，承担全部
      if (transaction.treatedBy === traveler) {
        share += transaction.amountCNY;
      }
    } else if (transaction.splitType === 'none') {
      // 不分摊：如果是付款人，自己承担
      if (transaction.payer === traveler) {
        share += transaction.amountCNY;
      }
    }
  });

  return share;
}

/**
 * 格式化金额显示
 * @param amount 金额
 * @param currency 货币符号
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number, currency: string = '¥'): string {
  return `${currency}${amount.toFixed(2)}`;
}

/**
 * 将KRW转换为CNY
 * @param amountKRW 韩元金额
 * @param rate 汇率 (1 CNY = ? KRW)
 * @returns 人民币金额
 */
export function convertKRWToCNY(amountKRW: number, rate: number): number {
  return amountKRW / rate;
}

/**
 * 将CNY转换为KRW
 * @param amountCNY 人民币金额
 * @param rate 汇率 (1 CNY = ? KRW)
 * @returns 韩元金额
 */
export function convertCNYToKRW(amountCNY: number, rate: number): number {
  return amountCNY * rate;
}
