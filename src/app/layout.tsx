import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReduxProvider, ReCaptchaProvider } from "@/providers";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventifyConnect",
  description: "Connecting People Together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReCaptchaProvider>
          <ReduxProvider>{children}</ReduxProvider>
        </ReCaptchaProvider>
      </body>
    </html>
  );
}
