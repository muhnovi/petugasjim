"use client";

import { Pencil, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { formatRupiah, isUuid } from "@/lib/utils";
import { StyledSelect } from "@/components/styled-select";

const dayOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
type Officer = { id: string; name: string };
type RecordItem = { id: string; officer_id: string | null; record_date: string; amount: number; notes: string | null; officer: { name: string } | null };

function getDayNumber(date: string) {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 ? 7 : day;
}

export function JimpitanManager() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [scheduledOfficers, setScheduledOfficers] = useState<Officer[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [officerId, setOfficerId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const supabase = createClient();
    const [officerResult, recordResult] = await Promise.all([
      supabase.from("officers").select("id, name").eq("is_active", true).order("name"),
      supabase.from("jimpitan_records").select("id, officer_id, record_date, amount, notes, officer:officers(name)").order("record_date", { ascending: false }).limit(100),
    ]);
    if (officerResult.error || recordResult.error) setMessage(officerResult.error?.message ?? recordResult.error?.message ?? "Data tidak dapat dimuat.");
    setOfficers((officerResult.data ?? []).filter((officer) => isUuid(officer.id)));
    setRecords((recordResult.data ?? []) as unknown as RecordItem[]);
    setLoading(false);
  };

  useEffect(() => {
    // Default date/day are initialized in the browser after hydration.
    const today = new Date().toISOString().slice(0, 10);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(today);
    setDay(String(getDayNumber(today)));
    void load();
  }, []);

  useEffect(() => {
    if (!day) {
      return;
    }
    let active = true;
    const loadSchedule = async () => {
      const { data, error } = await createClient().from("weekly_schedules").select("officer_id").eq("day_of_week", Number(day));
      if (!active) return;
      if (error) {
        setMessage(error.message);
        setScheduledOfficers([]);
        return;
      }
      const ids = new Set((data ?? []).map((item) => item.officer_id).filter(isUuid));
      setScheduledOfficers(officers.filter((officer) => ids.has(officer.id)));
      setOfficerId((current) => ids.has(current) ? current : "");
    };
    void loadSchedule();
    return () => { active = false; };
  }, [day, officers]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!day || !date || !isUuid(officerId) || !Number.isFinite(numericAmount) || numericAmount < 0) {
      setMessage("Pilih hari, tanggal, petugas sesuai jadwal, dan nominal yang valid.");
      return;
    }
    setSaving(true);
    setMessage("");
    const result = editing
      ? await createClient().from("jimpitan_records").update({ officer_id: officerId, record_date: date, amount: numericAmount, notes: notes.trim() || null }).eq("id", editing.id)
      : await createClient().from("jimpitan_records").insert({ officer_id: officerId, record_date: date, amount: numericAmount, notes: notes.trim() || null });
    if (result.error) setMessage(result.error.message);
    else {
      setMessage(editing ? "Pemasukan berhasil diperbarui." : "Pemasukan berhasil disimpan.");
      reset();
      await load();
    }
    setSaving(false);
  };

  const reset = () => {
    setEditing(null);
    setOfficerId("");
    setAmount("");
    setNotes("");
    setDate("");
    setDay("");
    setScheduledOfficers([]);
  };

  const edit = (item: RecordItem) => {
    setEditing(item);
    setOfficerId(item.officer_id ?? "");
    setDate(item.record_date);
    setDay(String(getDayNumber(item.record_date)));
    setAmount(String(item.amount));
    setNotes(item.notes ?? "");
  };

  const remove = async (item: RecordItem) => {
    if (!window.confirm("Hapus pencatatan ini?")) return;
    const { error } = await createClient().from("jimpitan_records").delete().eq("id", item.id);
    setMessage(error?.message ?? "Pemasukan berhasil dihapus.");
    if (!error) await load();
  };

  const total = useMemo(() => records.reduce((sum, item) => sum + Number(item.amount), 0), [records]);

  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
    <form onSubmit={submit} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
      <h2 className="mb-2 text-2xl font-bold">{editing ? "Edit pemasukan" : "Catat pemasukan"}</h2>
      <p className="mb-6 text-xs text-[var(--muted)]">Pilih hari untuk menampilkan petugas yang bertugas pada hari tersebut.</p>
      <div className="space-y-4">
        <label className="block space-y-2"><span className="text-xs font-semibold">Hari jadwal</span><StyledSelect ariaLabel="Pilih hari jadwal" value={day} onChange={setDay} placeholder="Pilih hari" options={dayOptions.map((label, index) => ({ value: String(index + 1), label }))} /></label>
        <label className="block space-y-2"><span className="text-xs font-semibold">Tanggal pencatatan</span><input required type="date" value={date} onChange={(event) => { setDate(event.target.value); setDay(String(getDayNumber(event.target.value))); }} className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm outline-none focus:border-[var(--olive)]" /></label>
        <label className="block space-y-2"><span className="text-xs font-semibold">Petugas pada hari {day ? dayOptions[Number(day) - 1] : "terpilih"}</span><StyledSelect ariaLabel="Pilih petugas sesuai jadwal" value={officerId} onChange={setOfficerId} disabled={!day || scheduledOfficers.length === 0} placeholder={scheduledOfficers.length ? "Pilih petugas" : "Belum ada petugas di hari ini"} options={scheduledOfficers.map((officer) => ({ value: officer.id, label: officer.name }))} /></label>
        <label className="block space-y-2"><span className="text-xs font-semibold">Nominal pemasukan</span><input required inputMode="numeric" type="text" value={amount ? formatRupiah(Number(amount)) : ""} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))} placeholder="Rp 0" className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm outline-none focus:border-[var(--olive)]" /><span className="block text-[11px] text-[var(--muted)]">Masukkan angka, contoh: Rp 15.000</span></label>
        <label className="block space-y-2"><span className="text-xs font-semibold">Catatan tambahan</span><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opsional" className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm outline-none focus:border-[var(--olive)]" /></label>
        <div className="flex gap-2"><button disabled={saving} className="flex-1 rounded-xl bg-[var(--ink)] py-3 text-xs font-semibold text-[var(--surface)] disabled:opacity-50">{saving ? "Menyimpan..." : editing ? "Perbarui pemasukan" : "Simpan pemasukan"}</button>{editing && <button type="button" onClick={reset} className="rounded-xl border border-[var(--line)] px-4 text-xs font-semibold">Batal</button>}</div>
        {message && <p className="text-xs leading-5 text-[var(--olive)]">{message}</p>}
      </div>
    </form>
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs text-[var(--muted)]">Total 100 pencatatan terakhir</p><h2 className="mt-1 text-2xl font-bold">{formatRupiah(total)}</h2></div><span className="text-xs text-[var(--muted)]">{records.length} transaksi</span></div>{loading ? <p className="py-10 text-center text-sm text-[var(--muted)]">Memuat pemasukan...</p> : records.length === 0 ? <p className="border-t border-dashed border-[var(--line)] py-12 text-center text-sm text-[var(--muted)]">Belum ada pencatatan pemasukan.</p> : <div className="divide-y divide-[var(--line)]">{records.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-4"><div><p className="text-sm font-semibold">{item.officer?.name ?? "Petugas dihapus"}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.record_date} {item.notes ? `· ${item.notes}` : ""}</p></div><div className="flex items-center gap-3"><span className="text-sm font-bold">{formatRupiah(Number(item.amount))}</span><button onClick={() => edit(item)} aria-label="Edit" className="text-[var(--muted)]"><Pencil size={15} /></button><button onClick={() => void remove(item)} aria-label="Hapus" className="text-[#9b5b4b]"><Trash2 size={15} /></button></div></div>)}</div>}</div>
  </div>;
}
