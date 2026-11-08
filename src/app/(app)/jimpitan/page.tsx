import { PageHeader } from "@/components/page-header";
import { JimpitanManager } from "@/components/jimpitan-manager";
export default function JimpitanPage() {
  return <><PageHeader eyebrow="Pencatatan harian" title="Pemasukan jimpitan" description="Catat pemasukan harian dengan rapi. Data tersimpan langsung di Supabase." /><JimpitanManager /></>;
}
