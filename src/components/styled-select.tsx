"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

export function StyledSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  ariaLabel,
  disabled = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div ref={ref} className={`relative ${className}`}>
    <button type="button" aria-label={ariaLabel} aria-expanded={open} disabled={disabled} onClick={() => setOpen((current) => !current)} className={`app-select flex min-h-12 w-full items-center justify-between rounded-2xl bg-[#fbf7ef] px-4 py-3 text-left text-sm shadow-sm transition-all hover:-translate-y-px hover:shadow-md ${open ? "border-[var(--olive)] bg-[#fdf9f1] ring-2 ring-[#778268]/15" : ""} disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm`}>
      <span className={selected ? "text-[var(--ink)]" : "text-[var(--muted)]"}>{selected?.label ?? placeholder}</span>
      <ChevronDown size={17} className={`shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-60 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1 shadow-xl">
      {options.map((option) => <button type="button" role="option" aria-selected={option.value === value} key={option.value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-[var(--surface-strong)] ${option.value === value ? "bg-[var(--surface-strong)] font-semibold" : ""}`}><span>{option.label}</span>{option.value === value && <Check size={15} className="text-[var(--olive)]" />}</button>)}
    </div>}
  </div>;
}
