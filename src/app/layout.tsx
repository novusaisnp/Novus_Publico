import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novus Público",
  description: "Plataforma Pública Modular",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
