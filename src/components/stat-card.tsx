import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export function StatCard({ label, value, note, accent = false, trend }: { label: string; value: number; note: string; accent?: boolean; trend?: "up" | "down" }) {
  return <div className={`rounded-2xl border border-[var(--line)] p-5 ${accent ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface)]"}`}>
    <div className="mb-7 flex items-start justify-between"><p className={`text-xs ${accent ? "text-[#cfc5b2]" : "text-[var(--muted)]"}`}>{label}</p>{trend && (trend === "up" ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />)}</div>
    <p className="font-serif text-2xl font-bold">{formatRupiah(value)}</p><p className={`mt-2 text-xs ${accent ? "text-[#cfc5b2]" : "text-[var(--muted)]"}`}>{note}</p>
  </div>;
}
