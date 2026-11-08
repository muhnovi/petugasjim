import { PageHeader } from "@/components/page-header";
import { MonthlyReport } from "@/components/monthly-report";
export default function LaporanPage() {
  return <><PageHeader eyebrow="Ringkasan keuangan" title="Laporan" description="Pantau perkembangan pemasukan dan posisi denda berdasarkan bulan yang dipilih." /><MonthlyReport mode="summary" /></>;
}
