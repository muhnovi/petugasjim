import { PageHeader } from "@/components/page-header";
import { OfficerManager } from "@/components/officer-manager";
export default function PetugasPage() {
  return <><PageHeader eyebrow="Data master" title="Daftar petugas" description="Kelola nama petugas yang dapat dipilih dalam jadwal, pemasukan, dan denda." /><OfficerManager /></>;
}
