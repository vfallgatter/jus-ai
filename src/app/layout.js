import './globals.css';

export const metadata = {
  title: 'Jus.ai — Assistente de Direito',
  description: 'Análise inteligente de materiais de aula',
  themeColor: '#050d1a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#050d1a" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}