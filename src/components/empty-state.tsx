import { Inbox } from "lucide-react";
export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center"><Inbox className="mx-auto mb-4 text-[var(--olive)]" size={28} /><h3 className="font-serif text-xl font-bold">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p></div>;
}
