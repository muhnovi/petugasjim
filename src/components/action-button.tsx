import { Plus } from "lucide-react";
export function ActionButton({ children = "Tambah data" }: { children?: React.ReactNode }) {
  return <button type="button" className="flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-xs font-semibold text-[var(--surface)] transition hover:opacity-90"><Plus size={15} />{children}</button>;
}
