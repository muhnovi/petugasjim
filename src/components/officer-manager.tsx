"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Power, Search, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type Officer = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export function OfficerManager() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Officer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadOfficers = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("officers").select("id, name, is_active, created_at").order("name");
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setOfficers(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchInitialOfficers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("officers").select("id, name, is_active, created_at").order("name");
      if (cancelled) return;
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setOfficers(data ?? []);
      }
      setLoading(false);
    };
    void fetchInitialOfficers();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOfficers = useMemo(() => officers.filter((officer) => {
    const matchesSearch = officer.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || (status === "active" ? officer.is_active : !officer.is_active);
    return matchesSearch && matchesStatus;
  }), [officers, search, status]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setMessage(null);
    setShowForm(true);
  };

  const openEdit = (officer: Officer) => {
    setEditing(officer);
    setName(officer.name);
    setMessage(null);
    setShowForm(true);
  };

  const saveOfficer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage({ type: "error", text: "Nama petugas wajib diisi." });
      return;
    }

    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const result = editing
      ? await supabase.from("officers").update({ name: trimmedName }).eq("id", editing.id)
      : await supabase.from("officers").insert({ name: trimmedName });

    if (result.error) {
      setMessage({ type: "error", text: result.error.message });
    } else {
      setMessage({ type: "success", text: editing ? "Nama petugas diperbarui." : "Petugas berhasil ditambahkan." });
      setShowForm(false);
      setName("");
      setEditing(null);
      await loadOfficers();
    }
    setSaving(false);
  };

  const toggleOfficer = async (officer: Officer) => {
    const supabase = createClient();
    const { error } = await supabase.from("officers").update({ is_active: !officer.is_active }).eq("id", officer.id);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: officer.is_active ? "Petugas dinonaktifkan." : "Petugas diaktifkan." });
    await loadOfficers();
  };

  const deleteOfficer = async (officer: Officer) => {
    if (!window.confirm(`Hapus petugas "${officer.name}"? Riwayat yang sudah ada akan tetap tersimpan.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("officers").delete().eq("id", officer.id);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Petugas berhasil dihapus." });
    await loadOfficers();
  };

  return <div>
    <div className="mb-5 flex flex-wrap gap-3">
      <div className="flex max-w-sm flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3">
        <Search size={16} className="text-[var(--muted)]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama petugas..." className="w-full bg-transparent py-3 text-sm outline-none" />
      </div>
      <select aria-label="Filter status petugas" value={status} onChange={(event) => setStatus(event.target.value)} className="min-w-40 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
        <option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option>
      </select>
      <button onClick={openCreate} className="rounded-xl bg-[var(--ink)] px-4 py-3 text-xs font-semibold text-[var(--surface)]">Tambah petugas</button>
    </div>

    {message && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-[#b9c5a5] bg-[#edf1e8] text-[#526044]" : "border-[#d7b6ab] bg-[#f7e9e3] text-[#914f3e]"}`}>{message.text}</div>}

    {showForm && <form onSubmit={saveOfficer} className="mb-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-xl font-bold">{editing ? "Edit petugas" : "Tambah petugas"}</h2><button type="button" onClick={() => setShowForm(false)} aria-label="Tutup form"><X size={18} /></button></div>
      <div className="flex flex-col gap-3 sm:flex-row"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama lengkap petugas" className="flex-1 rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-4 py-3 text-sm outline-none focus:border-[var(--olive)]" /><button disabled={saving} className="rounded-xl bg-[var(--ink)] px-5 py-3 text-xs font-semibold text-[var(--surface)] disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan"}</button></div>
    </form>}

    {loading ? <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">Memuat daftar petugas...</div> : filteredOfficers.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center"><p className="font-serif text-xl font-bold">{officers.length === 0 ? "Belum ada petugas" : "Petugas tidak ditemukan"}</p><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{officers.length === 0 ? "Tambahkan nama petugas terlebih dahulu untuk mulai menyusun jadwal jimpitan." : "Coba ubah kata pencarian atau filter status."}</p></div> : <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"><div className="hidden grid-cols-[1fr_140px_130px] border-b border-[var(--line)] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)] sm:grid"><span>Nama petugas</span><span>Status</span><span className="text-right">Aksi</span></div>{filteredOfficers.map((officer) => <div key={officer.id} className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 last:border-0 sm:grid sm:grid-cols-[1fr_140px_130px] sm:items-center"><span className="text-sm font-semibold">{officer.name}</span><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${officer.is_active ? "bg-[#e6eddf] text-[#5d704c]" : "bg-[#ebe6dc] text-[var(--muted)]"}`}>{officer.is_active ? "Aktif" : "Nonaktif"}</span><div className="flex justify-end gap-1"><button onClick={() => openEdit(officer)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-strong)]" aria-label={`Edit ${officer.name}`}><Pencil size={15} /></button><button onClick={() => void toggleOfficer(officer)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-strong)]" aria-label={`${officer.is_active ? "Nonaktifkan" : "Aktifkan"} ${officer.name}`}><Power size={15} /></button><button onClick={() => void deleteOfficer(officer)} className="rounded-lg p-2 text-[#9b5b4b] hover:bg-[#f4e3dc]" aria-label={`Hapus ${officer.name}`}><Trash2 size={15} /></button></div></div>)}</div>}
  </div>;
}
