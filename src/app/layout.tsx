import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "EduLink | 학교 교원 매칭 플랫폼",
  description: "학교와 교사를 빠르게 연결하는 경기권 교원 매칭 플랫폼입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="font-sans antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
