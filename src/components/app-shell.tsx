"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, CalendarDays, CircleDollarSign, ClipboardList, LayoutDashboard,
  LogOut, Menu, Settings, Users, WalletCards, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";

const navigation = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/jadwal", label: "Jadwal Petugas", icon: CalendarDays },
  { href: "/petugas", label: "Daftar Petugas", icon: Users },
  { href: "/jimpitan", label: "Pemasukan Jimpitan", icon: WalletCards },
  { href: "/denda", label: "Denda Petugas", icon: CircleDollarSign },
  { href: "/riwayat", label: "Riwayat", icon: ClipboardList },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <aside className={cn("fixed inset-y-0 left-0 z-30 flex h-dvh w-64 flex-col overflow-hidden border-r border-[var(--line)] bg-[var(--surface)] p-6 transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-8 flex shrink-0 items-start justify-between">
          <Link href="/dashboard" className="group">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-lg text-[var(--surface)]">J</div>
            <p className="font-serif text-xl font-bold leading-tight">Catatan<br />Jimpitan</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">Digital</p>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X size={20} /></button>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Menu utama</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors", active ? "bg-[var(--ink)] font-semibold text-[var(--surface)]" : "text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--ink)]")}>
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} /><span>{item.label}</span>
            </Link>;
          })}
        </nav>
        <div className="space-y-1 border-t border-[var(--line)] pt-4">
          <Link href="/pengaturan" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--muted)] hover:bg-[var(--surface-strong)]"><Settings size={18} />Pengaturan</Link>
          <button onClick={() => void logout()} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[var(--muted)] hover:bg-[var(--surface-strong)] disabled:opacity-50"><LogOut size={18} />{loggingOut ? "Keluar..." : "Keluar"}</button>
        </div>
      </aside>
      {open && <button aria-label="Tutup menu" onClick={() => setOpen(false)} className="fixed inset-0 z-20 bg-black/20 lg:hidden" />}
      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 lg:hidden">
          <button onClick={() => setOpen(true)}><Menu size={22} /></button>
          <span className="font-serif text-lg font-bold">Catatan Jimpitan</span><div className="w-6" />
        </header>
        <main className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-12 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
