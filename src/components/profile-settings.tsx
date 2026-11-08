"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (active) { setName(data?.full_name ?? user.user_metadata?.full_name ?? ""); setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, []);

  const save = async () => {
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage("Sesi login tidak ditemukan."); setSaving(false); return; }
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: name.trim() || null });
    if (error) setMessage(error.message); else { await supabase.auth.updateUser({ data: { full_name: name.trim() } }); setMessage("Profil berhasil disimpan."); }
    setSaving(false);
  };

  return <div className="max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7"><h2 className="mb-6 text-2xl font-bold">Profil bendahara</h2>{loading ? <p className="text-sm text-[var(--muted)]">Memuat profil...</p> : <div className="space-y-4"><label className="block space-y-2"><span className="text-xs font-semibold">Nama lengkap</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama bendahara" className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm outline-none focus:border-[var(--olive)]" /></label><label className="block space-y-2"><span className="text-xs font-semibold">Email akun</span><input value={email} readOnly className="w-full rounded-xl border border-[var(--line)] bg-[#ebe5d8] px-3.5 py-3 text-sm text-[var(--muted)]" /></label><button onClick={() => void save()} disabled={saving} className="rounded-xl bg-[var(--ink)] px-5 py-3 text-xs font-semibold text-[var(--surface)] disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan perubahan"}</button>{message && <p className="text-xs text-[var(--olive)]">{message}</p>}</div>}</div>;
}
