import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { CivicAuthProvider } from '@civic/auth-web3/nextjs';
import { Header } from '@/components/ui/Header';
import "./globals.css";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({ subsets: ["latin"] });

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
      <body className={`${roboto.className} bg-gray-950 text-gray-200`}>
        {/* Main cosmic background gradient */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-black bg-[radial-gradient(ellipse_at_top,rgba(16,69,102,0.4)_0%,rgba(10,20,30,0)_50%)]"></div>

        {/* Top cyan glow */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(0,0,0,0))]"></div>

        {/* Bottom purple glow */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(124,58,237,0.15),rgba(0,0,0,0))]"></div>

        {/* Starfield effect */}
        <div className="fixed inset-0 -z-5 opacity-70 animate-twinkle">
          <div className="stars-sm"></div>
          <div className="stars-md"></div>
          <div className="stars-lg"></div>
        </div>

        {/* Subtle grid pattern */}
        <div
          className="fixed inset-0 -z-20 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230891b2' fill-opacity='0.4'%3E%3Cpath d='M30 30L0 0h60L30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <CivicAuthProvider autoConnectEmbeddedWallet={true}>
          <Header />

          <main className="relative z-10">
            {children}
          </main>

          <Toaster position="bottom-center" toastOptions={{
            className: '!bg-gray-700 !text-white !border !border-cyan-600',
            success: { iconTheme: { primary: '#06b6d4', secondary: '#FFF' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#FFF' } },
          }} />
        </CivicAuthProvider>
      </body>
    </html>
  );
}