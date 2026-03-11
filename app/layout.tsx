import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";

const themeScript = `
(function() {
  try {
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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