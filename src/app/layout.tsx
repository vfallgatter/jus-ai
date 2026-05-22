import type { Metadata } from "next";

// @ts-ignore
import "./globals.css";

export const metadata: Metadata = {
  title: "Jus.ai - Assistente de Direito Civil",
  description: "Análise inteligente de materiais de aula e Direito Civil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}