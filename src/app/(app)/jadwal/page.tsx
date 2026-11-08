import { PageHeader } from "@/components/page-header";
import { ScheduleManager } from "@/components/schedule-manager";
export default function JadwalPage() {
  return <><PageHeader eyebrow="Pengaturan operasional" title="Jadwal petugas" description="Atur rotasi petugas untuk tujuh hari. Perubahan jadwal tidak mengubah riwayat pencatatan sebelumnya." /><ScheduleManager /></>;
}
