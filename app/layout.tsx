import type { Metadata } from "next";
import { Kanit } from "next/font/google";

const kanit = Kanit({
  weight: ["400", "700", "900"],
  subsets: ["thai"],
  display: "swap",
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Class Grid · ตารางเรียน",
  description: "ตารางเรียนรายสัปดาห์ ภาคการศึกษาที่ 1/2569",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={kanit.variable}>
      <body>{children}</body>
    </html>
  );
}
