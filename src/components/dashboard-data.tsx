"use client";

import { CalendarDays, ChevronRight, WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { createClient } from "@/lib/supabase/browser";

const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
export function DashboardData() {
  const [incomeToday, setIncomeToday] = useState(0);
  const [incomeMonth, setIncomeMonth] = useState(0);
  const [paid, setPaid] = useState(0);
  const [unpaid, setUnpaid] = useState(0);
  const [chart, setChart] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [todayOfficer, setTodayOfficer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const now = new Date();
      const iso = now.toISOString().slice(0, 10);
      const month = iso.slice(0, 7);
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const start = weekStart.toISOString().slice(0, 10);
      const supabase = createClient();
      const [today, monthly, fines, schedule] = await Promise.all([
        supabase.from("jimpitan_records").select("amount").eq("record_date", iso),
        supabase.from("jimpitan_records").select("record_date, amount").gte("record_date", `${month}-01`).lte("record_date", iso),
        supabase.from("fines").select("amount, payment_status"),
        supabase.from("weekly_schedules").select("officer:officers(name)").eq("day_of_week", ((now.getDay() + 6) % 7) + 1),
      ]);
      if (!active) return;
      setIncomeToday((today.data ?? []).reduce((sum, item) => sum + Number(item.amount), 0));
      setIncomeMonth((monthly.data ?? []).reduce((sum, item) => sum + Number(item.amount), 0));
      setPaid((fines.data ?? []).filter((item) => item.payment_status === "paid").reduce((sum, item) => sum + Number(item.amount), 0));
      setUnpaid((fines.data ?? []).filter((item) => item.payment_status === "unpaid").reduce((sum, item) => sum + Number(item.amount), 0));
      const totals = [0, 0, 0, 0, 0, 0, 0];
      (monthly.data ?? []).filter((item) => item.record_date >= start).forEach((item) => { const day = new Date(`${item.record_date}T00:00:00`).getDay(); totals[(day + 6) % 7] += Number(item.amount); });
      setChart(totals);
      const names = (schedule.data ?? []).map((item) => {
        const officer = item.officer as { name?: string } | null;
        return officer?.name;
      }).filter((name): name is string => Boolean(name));
      setTodayOfficer(names.join(", "));
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center text-sm text-[var(--muted)]">Memuat ringkasan...</div>;
  const max = Math.max(...chart, 1);
  return <><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Pemasukan hari ini" value={incomeToday} note="Dari pencatatan hari ini" accent trend="up" /><StatCard label="Pemasukan bulan ini" value={incomeMonth} note="Akumulasi bulan berjalan" /><StatCard label="Denda terkumpul" value={paid} note="Sudah dibayarkan" /><StatCard label="Denda belum dibayar" value={unpaid} note="Menjadi piutang" /></section><section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]"><div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7"><div className="flex items-start justify-between"><div><p className="text-xs text-[var(--muted)]">Pemasukan jimpitan</p><h2 className="mt-1 text-2xl font-bold">Minggu ini</h2></div><Link href="/laporan" className="flex items-center gap-1 text-xs text-[var(--olive)]">Lihat laporan <ChevronRight size={14} /></Link></div><div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">{chart.map((amount, index) => <div key={days[index]} className="flex flex-1 flex-col items-center gap-2"><div className="relative flex h-36 w-full items-end rounded-t-lg bg-[var(--surface-strong)]"><div className="w-full rounded-t-lg bg-[var(--olive)]" style={{ height: `${Math.max((amount / max) * 100, amount ? 5 : 0)}%` }} /></div><span className="text-[10px] text-[var(--muted)]">{days[index]}</span></div>)}</div></div><div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs text-[var(--muted)]">Jadwal hari ini</p><h2 className="mt-1 text-2xl font-bold">Petugas</h2></div><CalendarDays size={20} className="text-[var(--olive)]" /></div><div className="my-8 rounded-xl border border-dashed border-[var(--line)] p-6 text-center"><div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-strong)]"><WalletCards size={19} className="text-[var(--olive)]" /></div><p className="text-sm font-semibold">{todayOfficer || "Belum ada petugas"}</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{todayOfficer ? "Petugas sesuai jadwal hari ini." : "Atur jadwal mingguan agar petugas muncul di sini."}</p></div><Link href="/jadwal" className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] py-3 text-xs font-semibold hover:bg-[var(--surface-strong)]">Atur jadwal <ChevronRight size={15} /></Link></div></section></>;
}
