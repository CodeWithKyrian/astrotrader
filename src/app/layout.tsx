import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CivicAuthProvider } from '@civic/auth-web3/nextjs';
import { UserButtonClient } from '@/components/auth/UserButtonClient';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AstroTrader",
  description: "Embark on your galactic trading adventure!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <CivicAuthProvider autoConnectEmbeddedWallet={true}>
          <header className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h1 className="text-xl font-bold">AstroTrader</h1>
            <UserButtonClient />
          </header>
          <main className="p-4">
            {children}
          </main>
          <footer className="p-4 border-t border-gray-700 text-center text-xs text-gray-500">
            Powered by Civic & Solana
          </footer>
        </CivicAuthProvider>
      </body>
    </html>
  );
}