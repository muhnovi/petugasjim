import { PageHeader } from "@/components/page-header";
import { MonthlyReport } from "@/components/monthly-report";
export default function RiwayatPage() {
  return <><PageHeader eyebrow="Arsip pencatatan" title="Riwayat transaksi" description="Telusuri pemasukan jimpitan dan denda berdasarkan bulan yang dipilih." /><MonthlyReport mode="history" /></>;
}
