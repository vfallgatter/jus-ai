import './globals.css';

export const metadata = {
  title: 'Jus.ai - Assistente de Direito Civil',
  description: 'Análise inteligente de materiais de aula e Direito Civil',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}