import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catatan Jimpitan Digital",
  description: "Pengelolaan jimpitan, jadwal petugas, dan denda warga.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
