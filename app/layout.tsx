import type { Metadata, Viewport } from "next";
import { Anton, Bai_Jamjuree, Prompt } from "next/font/google";
import "./globals.css";
import "../components/Schedule.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#141414",
};

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
});

const prompt = Prompt({
  weight: ["400", "600", "800"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-prompt",
});

const baiJamjuree = Bai_Jamjuree({
  weight: ["600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-bai-jamjuree",
});

export const metadata: Metadata = {
  title: "Class Schedule · ตารางเรียน",
  description: "ตารางเรียนรายสัปดาห์ ภาคการศึกษาที่ 2/2569",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${anton.variable} ${prompt.variable} ${baiJamjuree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
