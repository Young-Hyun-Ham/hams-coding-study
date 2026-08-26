import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CSharpRuntimeLoader } from "@/components/csharp-runtime-loader";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "HAMS Coding Study",
  description: "Monaco Editor와 Pyodide를 이용한 코딩 스터디 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <base href="/" />
      </head>
      <body className="min-h-full flex flex-col">
        <CSharpRuntimeLoader />
        <Providers>
          <SiteHeader />
          <div className="site-body">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
