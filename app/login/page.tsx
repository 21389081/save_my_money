"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChartPie, ShieldCheck, WalletCards } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";

export default function LoginPage() {
  const router = useRouter();
  const { hydrated, state, setSession } = useApp();

  useEffect(() => {
    if (hydrated && state.session) router.replace("/");
  }, [hydrated, router, state.session]);

  const login = () => {
    setSession({ name: "Vincent" });
    router.push("/");
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="flex min-h-[52vh] flex-col justify-between bg-primary-soft px-7 py-9 sm:px-12 lg:min-h-screen lg:px-16 lg:py-14">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white text-primary-strong shadow-sm">
            <WalletCards size={23} />
          </span>
          <span className="text-lg font-bold">好好記帳</span>
        </div>
        <div className="my-12 max-w-xl lg:my-0">
          <h1 className="text-[clamp(2.25rem,6vw,4.6rem)] font-bold leading-[1.05] tracking-[-0.05em] text-foreground">
            每一筆生活，
            <br />
            都值得好好安排。
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted sm:text-lg">
            簡單記下收入與支出，掌握每本帳本的預算，讓錢花得更明白。
          </p>
        </div>
        <div className="grid max-w-xl gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 text-sm font-semibold">
            <ShieldCheck className="text-income" size={20} />
            資料暫存於這台裝置
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 text-sm font-semibold">
            <ChartPie className="text-primary-strong" size={20} />
            自動整理每月支出
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-7 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <p className="text-sm font-semibold text-primary-strong">歡迎回來</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">開始管理你的帳本</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            目前為前端示範版本，登入按鈕會建立本機使用狀態，不會連接 Google 或上傳資料。
          </p>
          <button
            type="button"
            onClick={login}
            disabled={!hydrated}
            className="mt-8 flex min-h-14 w-full items-center justify-between rounded-2xl border border-line bg-white px-5 text-sm font-bold shadow-[var(--shadow)] transition hover:border-primary hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-[#f7f7f7] text-base font-bold text-[#4285f4]">
                G
              </span>
              使用 Google 繼續
            </span>
            <ArrowRight size={19} />
          </button>
          <p className="mt-6 text-center text-xs leading-5 text-muted">
            繼續即表示你了解這是本機原型，未啟用雲端同步。
          </p>
        </div>
      </section>
    </main>
  );
}
