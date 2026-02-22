import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "MerchForge AI | Design & Sell AI-Powered Merch",
  description:
    "Generate merch designs with AI, customize mockups, and launch creator storefronts from one platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem("merchforge-theme");
                  var nextTheme = stored === "light" || stored === "dark"
                    ? stored
                    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                  document.documentElement.classList.remove("dark", "light");
                  document.documentElement.classList.add(nextTheme);
                } catch (error) {
                  document.documentElement.classList.add("dark");
                }
              })();
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
