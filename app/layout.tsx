import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "./ui/language";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "DevBox",
  description: "Local-first developer utilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
try {
  var savedTheme = window.localStorage.getItem("devbox-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : prefersDark ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme === "dark");
} catch (_) {}
`;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
