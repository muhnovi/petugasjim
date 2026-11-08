import { CircleAlert, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DashboardData } from "@/components/dashboard-data";

export default function DashboardPage() {
  const today = "Ringkasan hari ini";
  return <><PageHeader eyebrow={today} title="Selamat pagi, Bendahara." description="Satu tempat untuk menjaga catatan jimpitan tetap rapi, jelas, dan mudah ditinjau." action={<Link href="/jimpitan" className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-xs font-semibold text-[var(--surface)]"><Plus size={15} />Catat pemasukan</Link>} />
    {!process.env.NEXT_PUBLIC_SUPABASE_URL && <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#cbbd9f] bg-[#eee5d3] p-4 text-sm text-[var(--ink)]"><CircleAlert size={18} className="mt-0.5 shrink-0 text-[var(--olive)]" /><p><b>Supabase belum dikonfigurasi.</b> Tambahkan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> pada <code>.env.local</code> untuk mengaktifkan penyimpanan data.</p></div>}
    <DashboardData />
  </>;
}
