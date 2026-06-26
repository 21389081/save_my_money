"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  Home,
  Plus,
  Settings,
  WalletCards,
} from "lucide-react";
import { useApp } from "@/components/providers/app-provider";

const navigation = [
  { href: "/", label: "首頁", icon: Home },
  { href: "/stats", label: "統計", icon: BarChart3 },
  { href: "/ledgers", label: "帳本", icon: BookOpen },
  { href: "/settings", label: "設定", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authChecked, hydrated, state } = useApp();

  useEffect(() => {
    if (hydrated && authChecked && !state.session) router.replace("/login");
  }, [authChecked, hydrated, router, state.session]);

  if (!hydrated || !authChecked || !state.session) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <div className="flex items-center gap-3 text-sm font-medium text-muted">
          <span className="size-3 animate-pulse rounded-full bg-primary" />
          正在整理帳本…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:grid md:grid-cols-[248px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-line bg-white px-5 py-7 md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary-strong">
            <WalletCards size={23} strokeWidth={2.2} />
          </span>
          <span>
            <span className="block text-[17px] font-bold tracking-tight">好好記帳</span>
            <span className="text-xs text-muted">把生活過得更安心</span>
          </span>
        </Link>
        <nav className="mt-10 space-y-2">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
                  active
                    ? "bg-primary-soft text-primary-strong"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/transactions/new"
          className="mt-8 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary-strong px-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(36,120,184,.2)] transition hover:-translate-y-0.5 hover:bg-[#1d6da9]"
        >
          <Plus size={20} />
          新增一筆
        </Link>
        <div className="mt-auto rounded-2xl bg-surface p-4">
          <p className="text-xs text-muted">目前使用者</p>
          <p className="mt-1 truncate text-sm font-bold">{state.session.name}</p>
        </div>
      </aside>

      <main className="min-w-0 md:col-start-2">
        <div className="mx-auto min-h-screen w-full max-w-4xl px-5 pb-28 pt-7 sm:px-8 md:px-10 md:pb-12 md:pt-10">
          <div className="page-enter">{children}</div>
        </div>
      </main>

      <Link
        href="/transactions/new"
        aria-label="新增交易"
        className="fixed bottom-[calc(5.6rem+env(safe-area-inset-bottom))] right-5 z-40 grid size-14 place-items-center rounded-full bg-primary-strong text-white shadow-[0_12px_30px_rgba(36,120,184,.35)] transition active:scale-95 md:hidden"
      >
        <Plus size={26} strokeWidth={2.4} />
      </Link>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white/95 px-2 pt-2 backdrop-blur md:hidden">
        {navigation.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${
                active ? "text-primary-strong" : "text-muted"
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 1.9} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
