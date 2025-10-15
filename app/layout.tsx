import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "AI 메모장 - 음성으로 메모하고, AI가 정리해드립니다",
  description: "음성 인식으로 빠르게 기록하고, AI가 자동으로 요약과 태그를 생성하는 스마트 메모장 서비스",
  keywords: ["AI", "메모장", "음성인식", "자동요약", "태깅", "생산성"],
  authors: [{ name: "AI 메모장 팀" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "AI 메모장 - 음성으로 메모하고, AI가 정리해드립니다",
    description: "음성 인식으로 빠르게 기록하고, AI가 자동으로 요약과 태그를 생성하는 스마트 메모장 서비스",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
