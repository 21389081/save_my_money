'use client';

import { FormEvent, useState } from 'react';
import { BookOpen, Check, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useApp } from '@/components/providers/app-provider';
import { calculateBalance, calculateBudgetProgress } from '@/lib/finance';
import { formatCurrency } from '@/lib/format';
import { validateMoneyBook } from '@/lib/validation';

export default function MoneyBookPage() {
    const { state, addMoneyBook, deleteMoneyBook, selectMoneyBook } = useApp();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [errors, setErrors] = useState<ReturnType<typeof validateMoneyBook>>({});

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const how_much = Number(budget);
        const nextErrors = validateMoneyBook({ name, how_much });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        await addMoneyBook({
            name: name.trim(),
            how_much,
        });
        setName('');
        setBudget('');
        setOpen(false);
    };

    const remove = (money_book_id: number, money_book_name: string) => {
        if (state.money_book.length === 1) {
            window.alert('至少需要保留一本帳本。');
            return;
        }
        if (window.confirm(`刪除「${money_book_name}」也會刪除其中所有交易，確定繼續嗎？`)) {
            void deleteMoneyBook(money_book_id);
        }
    };

    return (
        <>
            <PageHeader
                title='我的帳本'
                description='管理不同用途的帳本，並切換目前使用中的帳本。'
                action={
                    <button
                        type='button'
                        onClick={() => setOpen((value) => !value)}
                        className='flex min-h-11 items-center gap-2 rounded-2xl bg-primary-soft px-6 text-sm font-bold text-primary-strong shrink-0'
                    >
                        <Plus size={12} /> 新增
                    </button>
                }
            />

            {open ? (
                <form
                    onSubmit={submit}
                    className='mb-7 rounded-[28px] border border-line bg-surface p-5 sm:p-6'
                >
                    <h2 className='font-bold'>建立新帳本</h2>
                    <div className='mt-5 grid gap-4 sm:grid-cols-2'>
                        <label>
                            <span className='mb-2 block text-xs font-bold text-muted'>
                                帳本名稱
                            </span>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder='例如：日常生活'
                                className='min-h-13 w-full rounded-2xl border border-line bg-white px-4 text-sm outline-none focus:border-primary'
                            />
                            {errors.name ? (
                                <span className='mt-1.5 block text-xs text-expense'>
                                    {errors.name}
                                </span>
                            ) : null}
                        </label>
                        <label>
                            <span className='mb-2 block text-xs font-bold text-muted'>預算</span>
                            <input
                                value={budget}
                                onChange={(event) => setBudget(event.target.value)}
                                type='number'
                                inputMode='numeric'
                                placeholder='30000'
                                className='min-h-13 w-full rounded-2xl border border-line bg-white px-4 text-sm outline-none focus:border-primary'
                            />
                            {errors.how_much ? (
                                <span className='mt-1.5 block text-xs text-expense'>
                                    {errors.how_much}
                                </span>
                            ) : null}
                        </label>
                    </div>
                    <button
                        type='submit'
                        className='mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-strong text-sm font-bold text-white sm:w-auto sm:px-7'
                    >
                        <Check size={18} /> 建立帳本
                    </button>
                </form>
            ) : null}

            <div className='space-y-4'>
                {state.money_book.map((money_book) => {
                    const transactions = state.transactions.filter(
                        (item) => item.money_book_id === money_book.id,
                    );
                    const balance = calculateBalance(money_book, transactions);
                    const progress = calculateBudgetProgress(money_book, transactions);
                    const active = state.current_money_book_id === money_book.id;
                    return (
                        <article
                            key={money_book.id}
                            className={`rounded-[26px] border p-5 transition sm:p-6 ${
                                active
                                    ? 'border-primary bg-primary-soft'
                                    : 'border-line bg-white hover:border-primary/60'
                            }`}
                        >
                            <div className='flex items-start gap-4'>
                                <button
                                    type='button'
                                    onClick={() => selectMoneyBook(money_book.id)}
                                    className='flex min-w-0 flex-1 items-start gap-4 text-left'
                                >
                                    <span
                                        className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                                            active
                                                ? 'bg-white text-primary-strong'
                                                : 'bg-surface text-muted'
                                        }`}
                                    >
                                        <BookOpen size={20} />
                                    </span>
                                    <span className='min-w-0 flex-1'>
                                        <span className='flex items-center gap-2'>
                                            <span className='truncate font-bold'>
                                                {money_book.name}
                                            </span>
                                            {active ? (
                                                <span className='rounded-full bg-white px-2 py-1 text-[10px] font-bold text-primary-strong'>
                                                    使用中
                                                </span>
                                            ) : null}
                                        </span>
                                        <span className='mt-1 block text-xs text-muted'>
                                            預算 {formatCurrency(money_book.how_much)} ·{' '}
                                            {transactions.length} 筆交易
                                        </span>
                                        <span className='mt-4 block text-xs font-semibold text-muted'>
                                            目前餘額
                                        </span>
                                        <span className='mt-1 block text-xl font-bold tabular-nums'>
                                            {formatCurrency(balance)}
                                        </span>
                                        <span className='mt-4 block h-1.5 overflow-hidden rounded-full bg-white'>
                                            <span
                                                className={`block h-full rounded-full ${
                                                    progress.isOverBudget
                                                        ? 'bg-expense'
                                                        : 'bg-primary'
                                                }`}
                                                style={{
                                                    width: `${Math.min(progress.percentage, 100)}%`,
                                                }}
                                            />
                                        </span>
                                    </span>
                                </button>
                                <button
                                    type='button'
                                    onClick={() => remove(money_book.id, money_book.name)}
                                    className='grid size-11 shrink-0 place-items-center rounded-2xl text-muted transition hover:bg-expense-soft hover:text-expense'
                                    aria-label={`刪除${money_book.name}`}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </>
    );
}
