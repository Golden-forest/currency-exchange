'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TravelerAvatars } from './TripLedgerCard/TravelerAvatars';
import { SettingsModal } from './TripLedgerCard/SettingsModal';
import { AddTransactionModal } from './TripLedgerCard/AddTransactionModal';
import { SettlementModal } from './TripLedgerCard/SettlementModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { groupTransactionsByDate, calculateSettlement } from '@/utils/tripCalculations';
import { generateTransactionId } from '@/utils/idGenerator';
import type { TripSettings, Transaction } from '@/types/trip';

type Props = {
  initialRate?: number;
  autoOpenAddModal?: boolean;
  onModalOpenStateChanged?: (isOpen: boolean) => void;
};

export function TripLedgerCard({
  initialRate,
  autoOpenAddModal = false,
  onModalOpenStateChanged
}: Props) {
    // 状态管理
    const [settings, setSettings] = useLocalStorage<TripSettings | null>('tripSettings', null);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('tripTransactions', []);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [showSettlement, setShowSettlement] = useState(false);

    // 处理自动打开 modal
    useEffect(() => {
        if (autoOpenAddModal && settings) {
            setShowAddTransaction(true);
        }
    }, [autoOpenAddModal, settings]);

    // 通知父组件 modal 状态变化
    useEffect(() => {
        if (onModalOpenStateChanged) {
            onModalOpenStateChanged(showAddTransaction);
        }
    }, [showAddTransaction, onModalOpenStateChanged]);

    // 计算总支出
    const totalSpent = transactions.reduce((sum, t) => sum + t.amountKRW, 0);

    // 计算预算使用百分比
    const budgetPercentage = settings ? (totalSpent / settings.totalBudget) * 100 : 0;

    // 计算剩余预算
    const remainingBudget = settings ? settings.totalBudget - totalSpent : 0;

    // 生成分组交易(按日期)
    const groupedTransactions = useMemo(() => {
        return groupTransactionsByDate(transactions);
    }, [transactions]);

    // 生成算账报告
    const settlementReport = useMemo(() => {
        if (!settings || transactions.length === 0) return [];
        return calculateSettlement(transactions, settings.travelers);
    }, [transactions, settings]);

    // 格式化金额
    const formatKRW = (amount: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatCNY = (amount: number) => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // 格式化时间
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateString === today.toISOString().split('T')[0]) {
            return 'TODAY';
        } else if (dateString === yesterday.toISOString().split('T')[0]) {
            return 'YESTERDAY';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }).toUpperCase();
        }
    };

    // 处理设置保存
    const handleSaveSettings = (newSettings: TripSettings) => {
        setSettings(newSettings);
    };

    // 添加交易
    const handleAddTransaction = (data: Omit<Transaction, 'id' | 'timestamp' | 'date'>) => {
        const newTransaction: Transaction = {
            ...data,
            id: generateTransactionId(),
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0],
        };
        setTransactions([...transactions, newTransaction]);
    };

    // 清空所有数据
    const handleClearData = () => {
        setTransactions([]);
        setSettings(null);
    };

    return (
        <div className="w-full max-w-lg bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E1] rounded-[3rem] sm:rounded-[4rem] p-6 sm:p-8 shadow-soft-out-lg relative overflow-hidden h-full flex flex-col">
            {/* Card Title */}
            <div className="text-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] bg-clip-text text-transparent">
                    Road to Freedom
                </h2>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#2D3436]">Trip Ledger</h2>
                    <div className="flex items-center text-[#636E72] mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{settings?.location || '未设置'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* 算账按钮 */}
                    {settings && transactions.length > 0 && (
                        <button
                            onClick={() => setShowSettlement(true)}
                            className="p-2 bg-white rounded-full shadow-soft-out hover:shadow-soft-in transition-all active:scale-95"
                            title="算账"
                        >
                            <svg className="w-5 h-5 text-[#FF6B81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </button>
                    )}
                    {/* 设置按钮 */}
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 bg-white rounded-full shadow-soft-out hover:shadow-soft-in transition-all active:scale-95"
                        title="设置"
                    >
                        <svg className="w-5 h-5 text-[#636E72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Total Spent Card */}
            <div className="bg-[#1E272E] rounded-3xl p-6 text-white mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#FF6B81] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    ₩ Budget
                </div>
                <div className="text-sm font-medium opacity-60 mb-2">TOTAL SPENT</div>
                <div className="text-3xl font-bold mb-4">
                    {formatKRW(totalSpent)}{' '}
                    {settings && <span className="opacity-40 text-lg">/ {formatKRW(settings.totalBudget)}</span>}
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-white/20 rounded-full mb-2">
                    <div
                        className="h-full bg-gradient-to-r from-[#FF6B81] to-[#F7D794] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] font-bold opacity-60">
                    <span>{budgetPercentage.toFixed(0)}% used</span>
                    <span>{settings && formatKRW(remainingBudget)} left</span>
                </div>
            </div>

            {/* Traveler Avatars */}
            {settings && settings.travelers.length > 0 && (
                <div className="flex justify-between items-center mb-6">
                    <TravelerAvatars travelers={settings.travelers} />
                    <button
                        onClick={() => setShowAddTransaction(true)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-[#FF6B81]"
                        title="添加消费记录"
                    >
                        +
                    </button>
                </div>
            )}

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!settings ? (
                    // 首次使用提示
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">✈️</div>
                        <h3 className="text-lg font-bold text-[#2D3436] mb-2">开始您的旅行</h3>
                        <p className="text-sm text-[#636E72] mb-6">点击右上角设置按钮配置您的旅行信息</p>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B81] to-[#FF9FF3] text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
                        >
                            设置旅行
                        </button>
                    </div>
                ) : groupedTransactions.length === 0 ? (
                    // 无交易记录提示
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-lg font-bold text-[#2D3436] mb-2">暂无交易记录</h3>
                        <p className="text-sm text-[#636E72]">点击右下角的"+"按钮添加您的第一笔消费</p>
                    </div>
                ) : (
                    // 显示交易列表
                    <div className="space-y-6">
                        {groupedTransactions.map((group) => (
                            <div key={group.date}>
                                {/* 日期标题 */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-bold text-[#A4B0BE] tracking-widest uppercase">
                                        {formatDate(group.date)}, {new Date(group.date).getDate()}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#A4B0BE]">
                                        {formatCNY(group.totalAmount)}
                                    </span>
                                </div>

                                {/* 交易列表 */}
                                <div className="space-y-3">
                                    {group.transactions.map((t) => (
                                        <div key={t.id} className="bg-white rounded-[2.5rem] p-5 flex items-center border border-white">
                                            <div className="w-12 h-12 bg-[#F1F2F6] rounded-full flex items-center justify-center text-2xl mr-4">
                                                {t.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-[#2D3436] text-sm">{t.name}</h3>
                                                    <div className="text-right">
                                                        <div className="font-bold text-[#2D3436] text-sm">
                                                            {formatKRW(t.amountKRW)}
                                                        </div>
                                                        <div className="text-[10px] text-[#A4B0BE]">
                                                            {formatCNY(t.amountCNY)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center mt-1">
                                                    {t.splitType === 'even' && t.splitAmong && (
                                                        <span className="text-[9px] bg-[#E3F2FD] text-[#2196F3] px-2 py-0.5 rounded-full font-bold mr-2">
                                                            Split by {t.splitAmong.length}
                                                        </span>
                                                    )}
                                                    {t.splitType === 'treat' && t.treatedBy && (
                                                        <span className="text-[9px] bg-[#FFF3E0] text-[#FF9800] px-2 py-0.5 rounded-full font-bold mr-2">
                                                            {t.treatedBy}'s Treat
                                                        </span>
                                                    )}
                                                    <span className="text-[9px] text-[#CED6E0] font-medium ml-auto">
                                                        {formatTime(t.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showSettings && (
                <SettingsModal
                    settings={settings}
                    onSave={handleSaveSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {showAddTransaction && settings && (
                <AddTransactionModal
                    travelers={settings.travelers}
                    currentRate={initialRate || settings.currentRate}
                    onAdd={handleAddTransaction}
                    onClose={() => setShowAddTransaction(false)}
                />
            )}

            {showSettlement && settlementReport.length > 0 && (
                <SettlementModal
                    report={settlementReport}
                    onClose={() => setShowSettlement(false)}
                    onClear={handleClearData}
                />
            )}
        </div>
    );
}
