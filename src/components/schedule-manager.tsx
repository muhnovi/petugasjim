"use client";

import { CalendarDays, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { isUuid } from "@/lib/utils";

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
type Officer = { id: string; name: string };
type Schedule = { day_of_week: number; officer_id: string | null };

export function ScheduleManager() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [schedules, setSchedules] = useState<Record<number, string[]>>({});
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const supabase = createClient();
      const [officersResult, schedulesResult] = await Promise.all([
        supabase.from("officers").select("id, name").eq("is_active", true).order("name"),
        supabase.from("weekly_schedules").select("day_of_week, officer_id").order("day_of_week"),
      ]);
      if (cancelled) return;
      if (officersResult.error || schedulesResult.error) {
        setMessage({ type: "error", text: officersResult.error?.message ?? schedulesResult.error?.message ?? "Jadwal tidak dapat dimuat." });
      } else {
        const validOfficers = (officersResult.data ?? []).filter((officer) => isUuid(officer.id));
        setOfficers(validOfficers);
        const selected: Record<number, string[]> = {};
        (schedulesResult.data as Schedule[] ?? []).forEach((schedule) => {
          if (schedule.officer_id && isUuid(schedule.officer_id) && validOfficers.some((officer) => officer.id === schedule.officer_id)) {
            selected[schedule.day_of_week] = [...(selected[schedule.day_of_week] ?? []), schedule.officer_id];
          }
        });
        setSchedules(selected);
      }
      setLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const save = async (day: number) => {
    setSavingDay(day);
    setMessage(null);
    const supabase = createClient();
    const selected = (schedules[day] ?? []).filter(isUuid);
    const { error: deleteError } = await supabase.from("weekly_schedules").delete().eq("day_of_week", day);
    if (deleteError) {
      setMessage({ type: "error", text: deleteError.message });
      setSavingDay(null);
      return;
    }
    if (selected.length > 0) {
      const { error: insertError } = await supabase.from("weekly_schedules").insert(selected.map((officer_id) => ({ day_of_week: day, officer_id })));
      if (insertError) {
        const message = insertError.message.includes("weekly_schedules_day_of_week_key")
          ? "Database masih memakai aturan lama satu petugas per hari. Jalankan migration multi-petugas di Supabase SQL Editor terlebih dahulu."
          : insertError.message;
        setMessage({ type: "error", text: message });
        setSavingDay(null);
        return;
      }
    }
    setMessage({ type: "success", text: `Jadwal ${days[day - 1]} disimpan untuk ${selected.length} petugas.` });
    setSavingDay(null);
  };

  if (loading) return <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center text-sm text-[var(--muted)]">Memuat jadwal...</div>;

  return <div>
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm"><CalendarDays size={18} className="text-[var(--olive)]" /><span className="text-[var(--muted)]">Jadwal mingguan</span><span className="ml-auto text-xs text-[var(--muted)]">Pilih satu atau beberapa petugas per hari</span></div>
    {message && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-[#b9c5a5] bg-[#edf1e8] text-[#526044]" : "border-[#d7b6ab] bg-[#f7e9e3] text-[#914f3e]"}`}>{message.text}</div>}
    {officers.length === 0 && <div className="mb-5 rounded-xl border border-[#d7b6ab] bg-[#f7e9e3] p-4 text-sm text-[#914f3e]">Belum ada petugas aktif. Tambahkan petugas di menu <b>Daftar Petugas</b> terlebih dahulu.</div>}
    <div className="grid gap-3">{days.map((day, index) => {
      const dayNumber = index + 1;
      const selected = schedules[dayNumber] ?? [];
      return <div key={day} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><div className="mb-4 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-strong)] text-xs font-bold">{dayNumber}</span><span className="text-sm font-semibold">{day}</span><span className="text-xs text-[var(--muted)]">{selected.length} petugas</span><button onClick={() => void save(dayNumber)} disabled={savingDay === dayNumber || officers.length === 0} className="ml-auto flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-semibold hover:bg-[var(--surface-strong)] disabled:opacity-50"><Save size={15} />{savingDay === dayNumber ? "Menyimpan..." : "Simpan"}</button></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{officers.map((officer) => <label key={officer.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3 py-3 text-sm hover:bg-[var(--surface-strong)]"><input type="checkbox" checked={selected.includes(officer.id)} onChange={(event) => setSchedules((current) => ({ ...current, [dayNumber]: event.target.checked ? [...(current[dayNumber] ?? []), officer.id] : (current[dayNumber] ?? []).filter((id) => id !== officer.id) }))} disabled={officers.length === 0} className="h-4 w-4 accent-[var(--olive)]" /><span>{officer.name}</span></label>)}</div></div>;
    })}</div>
  </div>;
}
