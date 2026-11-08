"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Email atau kata sandi salah. Pastikan akun bendahara sudah dibuat di Supabase.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return <><form onSubmit={submit} className="mt-8 space-y-4"><label className="block space-y-2"><span className="text-xs font-semibold">Email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="bendahara@email.com" className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm outline-none focus:border-[var(--olive)]" /></label><label className="block space-y-2"><span className="text-xs font-semibold">Kata sandi</span><input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" className="w-full rounded-xl border border-[var(--line)] bg-[#fbf7ef] px-3.5 py-3 text-sm outline-none focus:border-[var(--olive)]" /></label>{error && <p role="alert" className="rounded-xl border border-[#d7b6ab] bg-[#f7e9e3] px-3 py-2 text-xs leading-5 text-[#914f3e]">{error}</p>}<button disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] py-3.5 text-sm font-semibold text-[var(--surface)] disabled:opacity-50">{loading ? "Memeriksa..." : <>Masuk <ArrowRight size={16} /></>}</button></form><div className="mt-6 flex items-center gap-2 text-xs text-[var(--muted)]"><LockKeyhole size={14} />Akses aman untuk bendahara</div></>;
}
