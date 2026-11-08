import { ArrowUpRight } from "lucide-react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
    <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--olive)]">{eyebrow}</p><h1 className="text-4xl font-bold sm:text-5xl">{title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{description}</p></div>
    {action ?? <div className="hidden items-center gap-2 text-xs text-[var(--muted)] md:flex">Pembaruan terakhir <ArrowUpRight size={14} /></div>}
  </div>;
}
