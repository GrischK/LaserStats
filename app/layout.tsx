import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";
import {Geist} from "next/font/google";
import {cn} from "@/lib/utils";

const geist = Geist({subsets: ["latin"], variable: "--font-sans"});

const themeScript = `
(function() {
  try {
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
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