'use client';

import { useRouter } from 'next/navigation';
import { Cloud, LogOut, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useApp } from '@/components/providers/app-provider';

export default function SettingsPage() {
    const router = useRouter();
    const { state, setSession } = useApp();

    const logout = () => {
        setSession(null);
        router.replace('/login');
    };

    const rows = [
        {
            icon: UserRound,
            label: '使用者',
            value: state.session?.name ?? '未登入',
        },
        { icon: Cloud, label: '同步狀態', value: '雲端已同步' },
    ];

    return (
        <>
            <PageHeader title='設定' description='管理目前的示範帳號與本機資料。' />

            <section className='overflow-hidden rounded-[26px] border border-line'>
                {rows.map((row) => {
                    const Icon = row.icon;
                    return (
                        <div
                            key={row.label}
                            className='flex min-h-[78px] items-center gap-4 border-b border-line px-5 last:border-b-0'
                        >
                            <span className='grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary-strong'>
                                <Icon size={19} />
                            </span>
                            <span className='min-w-0 flex-1'>
                                <span className='block text-xs font-semibold text-muted'>
                                    {row.label}
                                </span>
                                <span className='mt-1 block truncate text-sm font-bold'>
                                    {row.value}
                                </span>
                            </span>
                        </div>
                    );
                })}
            </section>

            <section className='mt-8 space-y-3'>
                <button
                    type='button'
                    onClick={logout}
                    className='flex min-h-14 w-full items-center gap-3 rounded-2xl bg-expense-soft px-5 text-left text-sm font-bold text-expense'
                >
                    <LogOut size={19} />
                    登出
                </button>
            </section>

            <p className='mt-8 text-center text-xs leading-5 text-muted'>
                好好記帳 v0.1 · Supabase 與 Google OAuth 將於後端階段加入
            </p>
        </>
    );
}
