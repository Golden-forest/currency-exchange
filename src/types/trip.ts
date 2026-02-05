/**
 * 旅行账本类型定义
 */

/**
 * 旅行设置
 */
export type TripSettings = {
  travelers: string[];        // 旅行者姓名数组
  totalBudget: number;        // 总预算(KRW)
  currentRate: number;        // 汇率(1 CNY = ? KRW)
  location: string;           // 旅行地点
};

/**
 * 分摊类型
 * - even: 平均分摊
 * - treat: 请客
 * - none: 不分摊(付款人自己承担)
 */
export type SplitType = 'even' | 'treat' | 'none';

/**
 * 交易记录
 */
export type Transaction = {
  id: string;                 // 唯一ID
  name: string;               // 商家名称
  amountKRW: number;          // 韩元金额
  amountCNY: number;          // 人民币金额(自动转换)
  payer: string;              // 付款人
  splitType: SplitType;       // 分摊类型
  splitAmong?: string[];      // 参与分摊的人员(如果是even)
  treatedBy?: string;         // 请客的人(如果是treat)
  timestamp: number;          // 时间戳
  icon: string;               // 图标emoji
  date: string;               // 日期字符串(用于分组显示)
};

/**
 * 算账报告项
 */
export type SettlementItem = {
  traveler: string;           // 旅行者姓名
  totalPaid: number;          // 总共付了多少钱(CNY)
  totalShare: number;         // 应该承担的费用(CNY)
  balance: number;            // 净额(应付-已付,正数该付,负数该收)
  color: string;              // 头像背景色
};

/**
 * 按日期分组的交易记录
 */
export type TransactionsByDate = {
  date: string;               // 日期字符串
  transactions: Transaction[]; // 该日期的交易记录
  totalAmount: number;        // 该日期的总金额
};
