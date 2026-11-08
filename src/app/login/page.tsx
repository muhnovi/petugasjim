import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-5"><div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm sm:p-10"><div className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink)] font-serif text-xl text-[var(--surface)]">J</div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--olive)]">Ruang bendahara</p><h1 className="text-4xl font-bold">Selamat datang.</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Masuk untuk mengelola catatan jimpitan kampung Anda.</p><LoginForm /></div></main>;
}
