"use client";

import { Download, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { formatRupiah } from "@/lib/utils";

type JimpitanRecord = {
  id: string;
  record_date: string;
  amount: number;
  notes: string | null;
  officer: { name: string } | null;
};

type Fine = {
  id: string;
  incident_date: string;
  amount: number;
  payment_status: "paid" | "unpaid";
  notes: string | null;
  officer: { name: string } | null;
};

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export function MonthlyReport({ mode }: { mode: "history" | "summary" }) {
  const [month, setMonth] = useState("");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<JimpitanRecord[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async (selectedMonth: string) => {
    setLoading(true);
    setError("");
    const [year, monthNumber] = selectedMonth.split("-").map(Number);
    const start = `${selectedMonth}-01`;
    const end = new Date(year, monthNumber, 0).toISOString().slice(0, 10);
    const supabase = createClient();
    const [jimpitanResult, finesResult] = await Promise.all([
      supabase.from("jimpitan_records").select("id, record_date, amount, notes, officer:officers(name)").gte("record_date", start).lte("record_date", end).order("record_date", { ascending: false }),
      supabase.from("fines").select("id, incident_date, amount, payment_status, notes, officer:officers(name)").gte("incident_date", start).lte("incident_date", end).order("incident_date", { ascending: false }),
    ]);

    if (jimpitanResult.error || finesResult.error) {
      setError(jimpitanResult.error?.message ?? finesResult.error?.message ?? "Data tidak dapat dimuat.");
    } else {
      setRecords((jimpitanResult.data ?? []) as unknown as JimpitanRecord[]);
      setFines((finesResult.data ?? []) as unknown as Fine[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const selectedMonth = currentMonth();
    // The initial month is resolved only in the browser to avoid prerender time access.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMonth(selectedMonth);
    void loadData(selectedMonth);
  }, []);

  const filteredRecords = useMemo(() => records.filter((record) => (record.officer?.name ?? "").toLowerCase().includes(search.toLowerCase())), [records, search]);
  const filteredFines = useMemo(() => fines.filter((fine) => (fine.officer?.name ?? "").toLowerCase().includes(search.toLowerCase())), [fines, search]);
  const totalIncome = records.reduce((sum, record) => sum + Number(record.amount), 0);
  const paidFines = fines.filter((fine) => fine.payment_status === "paid").reduce((sum, fine) => sum + Number(fine.amount), 0);
  const unpaidFines = fines.filter((fine) => fine.payment_status === "unpaid").reduce((sum, fine) => sum + Number(fine.amount), 0);

  const exportCsv = () => {
    const rows = [
      ["Tanggal", "Nama Petugas", "Jenis", "Nominal", "Status", "Catatan"],
      ...records.map((record) => [record.record_date, record.officer?.name ?? "-", "Pemasukan jimpitan", record.amount, "Tercatat", record.notes ?? ""]),
      ...fines.map((fine) => [fine.incident_date, fine.officer?.name ?? "-", "Denda", fine.amount, fine.payment_status === "paid" ? "Sudah bayar" : "Belum bayar", fine.notes ?? ""]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-jimpitan-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div>
    <div className="mb-6 flex flex-wrap gap-3">
      <label className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold">Bulan <input type="month" value={month} onChange={(event) => { setMonth(event.target.value); void loadData(event.target.value); }} className="bg-transparent text-sm outline-none" /></label>
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3"><Search size={16} className="text-[var(--muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama petugas..." className="w-full bg-transparent py-3 text-sm outline-none" /></div>
      <button onClick={exportCsv} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-xs font-semibold disabled:opacity-50"><Download size={15} />Export CSV bulan ini</button>
    </div>
    {error && <div className="mb-5 rounded-xl border border-[#d7b6ab] bg-[#f7e9e3] px-4 py-3 text-sm text-[#914f3e]">{error}</div>}
    {mode === "summary" && <div className="mb-6 grid gap-4 sm:grid-cols-3"><SummaryCard label="Total pemasukan" value={totalIncome} /><SummaryCard label="Denda terkumpul" value={paidFines} /><SummaryCard label="Piutang denda" value={unpaidFines} /></div>}
    {loading ? <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center text-sm text-[var(--muted)]">Memuat laporan bulan {month}...</div> : <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)]">{filteredRecords.length === 0 && filteredFines.length === 0 ? <div className="p-12 text-center"><p className="font-serif text-xl font-bold">Belum ada data</p><p className="mt-2 text-sm text-[var(--muted)]">Belum ada transaksi pada bulan yang dipilih.</p></div> : <table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-[var(--line)] text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]"><tr><th className="px-5 py-4">Tanggal</th><th className="px-5 py-4">Petugas</th><th className="px-5 py-4">Jenis</th><th className="px-5 py-4">Nominal</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Catatan</th></tr></thead><tbody>{filteredRecords.map((record) => <ReportRow key={`j-${record.id}`} date={record.record_date} officer={record.officer?.name} kind="Pemasukan jimpitan" amount={record.amount} status="Tercatat" notes={record.notes} />)}{filteredFines.map((fine) => <ReportRow key={`f-${fine.id}`} date={fine.incident_date} officer={fine.officer?.name} kind="Denda" amount={fine.amount} status={fine.payment_status === "paid" ? "Sudah bayar" : "Belum bayar"} notes={fine.notes} />)}</tbody></table>}</div>}
  </div>;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><p className="text-xs text-[var(--muted)]">{label}</p><p className="mt-5 font-serif text-2xl font-bold">{formatRupiah(value)}</p></div>;
}

function ReportRow({ date, officer, kind, amount, status, notes }: { date: string; officer?: string; kind: string; amount: number; status: string; notes: string | null }) {
  return <tr className="border-b border-[var(--line)] last:border-0"><td className="px-5 py-4">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`))}</td><td className="px-5 py-4 font-semibold">{officer ?? "-"}</td><td className="px-5 py-4">{kind}</td><td className="px-5 py-4">{formatRupiah(Number(amount))}</td><td className="px-5 py-4"><span className="rounded-full bg-[#e6eddf] px-2.5 py-1 text-[10px] font-bold text-[#5d704c]">{status}</span></td><td className="px-5 py-4 text-[var(--muted)]">{notes ?? "-"}</td></tr>;
}
