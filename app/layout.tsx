import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Schedule · ตารางเรียนและตารางสอบ",
  description: "ตารางเรียนและตารางสอบกลางภาค ภาคการศึกษาที่ 1/2569",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
