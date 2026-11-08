"use client";

import { Check, ChevronDown, Pencil, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { formatRupiah, isUuid } from "@/lib/utils";
import { StyledSelect } from "@/components/styled-select";

type Officer = { id: string; name: string };
type Fine = { id: string; officer_id: string | null; incident_date: string; amount: number; payment_status: "paid" | "unpaid"; notes: string | null; officer: { name: string } | null };

export function FineManager() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [officerId, setOfficerId] = useState("");
  const [officerSearch, setOfficerSearch] = useState("");
  const [officerMenuOpen, setOfficerMenuOpen] = useState(false);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"paid" | "unpaid">("unpaid");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<Fine | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const supabase = createClient();
    const [officerResult, fineResult] = await Promise.all([supabase.from("officers").select("id, name").eq("is_active", true).order("name"), supabase.from("fines").select("id, officer_id, incident_date, amount, payment_status, notes, officer:officers(name)").order("incident_date", { ascending: false }).limit(100)]);
    if (officerResult.error || fineResult.error) setMessage(officerResult.error?.message ?? fineResult.error?.message ?? "Data tidak dapat dimuat.");
    setOfficers((officerResult.data ?? []).filter((officer) => isUuid(officer.id)));
    setFines((fineResult.data ?? []) as unknown as Fine[]);
  };
  useEffect(() => {
    // Set the browser-local default date after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(new Date().toISOString().slice(0, 10));
    // Initial database synchronization.
    void load();
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isUuid(officerId) || !date) { setMessage("Nama petugas dan tanggal wajib diisi dengan data yang valid."); return; }
    const supabase = createClient();
    const payload = { officer_id: officerId, incident_date: date, amount: 15000, payment_status: status, paid_at: status === "paid" ? new Date().toISOString() : null, notes: notes.trim() || null };
    const result = editing ? await supabase.from("fines").update(payload).eq("id", editing.id) : await supabase.from("fines").insert(payload);
    if (result.error) setMessage(result.error.message); else { setMessage(editing ? "Denda berhasil diperbarui." : "Denda berhasil dicatat."); reset(); await load(); }
  };
  const reset = () => { setEditing(null); setOfficerId(""); setOfficerSearch(""); setOfficerMenuOpen(false); setDate(""); setStatus("unpaid"); setNotes(""); };
  const edit = (fine: Fine) => { setEditing(fine); setOfficerId(fine.officer_id ?? ""); setOfficerSearch(fine.officer?.name ?? ""); setDate(fine.incident_date); setStatus(fine.payment_status); setNotes(fine.notes ?? ""); };
  const togglePaid = async (fine: Fine) => { const next = fine.payment_status === "paid" ? "unpaid" : "paid"; const { error } = await createClient().from("fines").update({ payment_status: next, paid_at: next === "paid" ? new Date().toISOString() : null }).eq("id", fine.id); setMessage(error?.message ?? `Denda ditandai ${next === "paid" ? "sudah bayar" : "belum bayar"}.`); if (!error) await load(); };
  const remove = async (fine: Fine) => { if (!window.confirm("Hapus catatan denda ini?")) return; const { error } = await createClient().from("fines").delete().eq("id", fine.id); setMessage(error?.message ?? "Denda berhasil dihapus."); if (!error) await load(); };
  const visible = fines.filter((fine) => (filter === "all" || fine.payment_status === filter) && (fine.officer?.name ?? "").toLowerCase().includes(search.toLowerCase()));
  const filteredOfficers = officers.filter((officer) => officer.name.toLowerCase().includes(officerSearch.toLowerCase()));
  const selectedOfficer = officers.find((officer) => officer.id === officerId);
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><form onSubmit={submit} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7"><div className="mb-6"><h2 className="text-2xl font-bold">{editing ? "Edit denda" : "Catat pelanggaran"}</h2><p className="mt-1 text-xs text-[var(--muted)]">Nominal otomatis Rp15.000</p></div><div className="space-y-4"><div className="relative space-y-2"><span className="text-xs font-semibold">Nama petugas</span><button type="button" onClick={() => setOfficerMenuOpen((open) => !open)} className={`flex w-full items-center justify-between rounded-xl border bg-[#fbf7ef] px-3.5 py-3 text-left text-sm transition ${officerMenuOpen ? "border-[var(--olive)] ring-2 ring-[#778268]/15" : "border-[var(--line)]"}`}><span className={selectedOfficer ? "font-medium text-[var(--ink)]" : "text-[var(--muted)]"}>{selectedOfficer?.name ?? "Pilih petugas"}</span><ChevronDown size={17} className={`text-[var(--muted)] transition ${officerMenuOpen ? "rotate-180" : ""}`} /></button>{officerMenuOpen && <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-lg"><div className="flex items-center gap-2 border-b border-[var(--line)] px-3"><Search size={16} className="text-[var(--muted)]" /><input autoFocus value={officerSearch} onChange={(event) => setOfficerSearch(event.target.value)} placeholder="Cari nama petugas..." className="w-full bg-transparent py-3 text-sm outline-none" /><button type="button" onClick={() => setOfficerSearch("")} className="text-[var(--muted)]"><X size={15} /></button></div><div className="max-h-52 overflow-y-auto p-1">{filteredOfficers.length === 0 ? <p className="px-3 py-4 text-center text-xs text-[var(--muted)]">Petugas tidak ditemukan.</p> : filteredOfficers.map((officer) => <button type="button" key={officer.id} onClick={() => { setOfficerId(officer.id); setOfficerSearch(officer.name); setOfficerMenuOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[var(--surface-strong)] ${officer.id === officerId ? "bg-[var(--surface-strong)] font-semibold" : ""}`}><span>{officer.name}</span>{officer.id === officerId && <Check size={15} className="text-[var(--olive)]" />}</button>)}</div></div>}</div><label className="block space-y-2"><span className="text-xs font-semibold">Tanggal kejadian</span><input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm" /></label><label className="block space-y-2"><span className="text-xs font-semibold">Status pembayaran</span><StyledSelect ariaLabel="Status pembayaran denda" value={status} onChange={(value) => setStatus(value as "paid" | "unpaid")} options={[{ value: "unpaid", label: "Belum bayar" }, { value: "paid", label: "Sudah bayar" }]} /></label><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Keterangan (opsional)" className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm" /><div className="flex gap-2"><button className="flex-1 rounded-xl bg-[var(--ink)] py-3 text-xs font-semibold text-[var(--surface)]">{editing ? "Perbarui denda" : "Simpan denda"}</button>{editing && <button type="button" onClick={reset} className="rounded-xl border border-[var(--line)] px-4 text-xs font-semibold">Batal</button>}</div>{message && <p className="text-xs leading-5 text-[var(--olive)]">{message}</p>}</div></form><div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7"><div className="mb-5 flex flex-wrap gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama petugas..." className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3 py-3 text-sm outline-none" />    <StyledSelect ariaLabel="Filter status pembayaran" value={filter} onChange={setFilter} options={[{ value: "all", label: "Semua status" }, { value: "paid", label: "Sudah bayar" }, { value: "unpaid", label: "Belum bayar" }]} className="min-w-40" /></div>{visible.length === 0 ? <p className="border-t border-dashed border-[var(--line)] py-12 text-center text-sm text-[var(--muted)]">Belum ada catatan denda.</p> : <div className="divide-y divide-[var(--line)]">{visible.map((fine) => <div key={fine.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{fine.officer?.name ?? "Petugas dihapus"}</p><p className="mt-1 text-xs text-[var(--muted)]">{fine.incident_date} · {formatRupiah(Number(fine.amount))}</p><span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${fine.payment_status === "paid" ? "bg-[#e6eddf] text-[#5d704c]" : "bg-[#f3e5d7] text-[#9b6849]"}`}>{fine.payment_status === "paid" ? "Sudah bayar" : "Belum bayar"}</span></div><div className="flex gap-1"><button onClick={() => void togglePaid(fine)} aria-label="Ubah status" className="rounded-lg p-2 text-[var(--olive)]"><Check size={15} /></button><button onClick={() => edit(fine)} aria-label="Edit" className="rounded-lg p-2 text-[var(--muted)]"><Pencil size={15} /></button><button onClick={() => void remove(fine)} aria-label="Hapus" className="rounded-lg p-2 text-[#9b5b4b]"><Trash2 size={15} /></button></div></div>)}</div>}</div></div>;
}
