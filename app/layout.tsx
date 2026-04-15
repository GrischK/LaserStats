import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";
import {Geist} from "next/font/google";
import type {Metadata, Viewport} from "next";
import {cn} from "@/lib/utils";

const geist = Geist({subsets: ["latin"], variable: "--font-sans"});

export const metadata: Metadata = {
  title: "Laser-stats",
  description: "Suivi des tirs Laser Run",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {url: "/favicon.ico"},
      {url: "/icon-192.png", sizes: "192x192", type: "image/png"},
      {url: "/icon-512.png", sizes: "512x512", type: "image/png"},
    ],
    apple: [{url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png"}],
  },
  appleWebApp: {
    capable: true,
    title: "Laser-stats",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f7f5",
};

const themeScript = `
(function() {
  try {
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  }
})();
`;

export default function RootLayout({
                                     children,
                                   }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
    <head>
      <script dangerouslySetInnerHTML={{__html: themeScript}}/>
    </head>
    <body>
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
    </body>
    </html>
  );
}
