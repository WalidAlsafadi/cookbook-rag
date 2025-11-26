import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Cookbook RAG',
    default: 'Cookbook RAG Assistant',
  },
  description: 'Ask questions about The Low-Cost Cookbook using a LangChain + Chroma RAG backend.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}