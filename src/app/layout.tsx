import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EduLink | 학교와 교사를 잇는 채용 네트워크",
    template: "%s | EduLink",
  },
  description:
    "검증된 교사 인재풀과 학교 채용 공고를 안전하게 연결하는 교육 채용 네트워크입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="font-sans antialiased"
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
