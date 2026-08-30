import type { Metadata } from "next";
import { Archivo, Kanit } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const kanit = Kanit({
  weight: ["400", "700", "900"],
  subsets: ["thai"],
  display: "swap",
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Class Schedule · ตารางเรียน",
  description: "ตารางเรียนรายสัปดาห์ ภาคการศึกษาที่ 1/2569",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${archivo.variable} ${kanit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
