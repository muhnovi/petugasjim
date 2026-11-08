export function FormField({ label, type = "text", placeholder, defaultValue }: { label: string; type?: string; placeholder?: string; defaultValue?: string }) {
  return <label className="block space-y-2"><span className="text-xs font-semibold text-[var(--ink)]">{label}</span><input type={type} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm outline-none transition focus:border-[var(--olive)] focus:ring-2 focus:ring-[#778268]/15" /></label>;
}
