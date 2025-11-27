import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    // CHANGED: RecipeAI -> RecipaAI
    template: '%s | RecipaAI',
    default: 'RecipaAI - Precision Cooking with AI', 
  },
  // CHANGED: RecipeAI -> RecipaAI
  description: 'Your professional AI culinary assistant. Unlock recipes, manage ingredients, and cook smarter with RecipaAI.',
  // CHANGED: RecipeAI -> RecipaAI
  keywords: ['RecipaAI', 'Cookbook', 'AI', 'RAG', 'Next.js', 'Culinary', 'Recipes'],
  icons: {
    // Make sure you renamed your uploaded image to 'logo.png' and put it in the public folder
    icon: '/logo.png', 
  },
  openGraph: {
    title: 'RecipaAI - Precision Cooking with AI',
    description: 'Your professional AI culinary assistant.',
    siteName: 'RecipaAI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased flex flex-col bg-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}