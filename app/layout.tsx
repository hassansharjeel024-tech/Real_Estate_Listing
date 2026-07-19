import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/auth";

/**
 * Fraunces (a high-contrast, slightly wonky serif) for display, Inter for UI.
 * The pairing signals "property listing you can trust" without the estate-agent
 * cliché of an all-caps geometric sans.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap", axes: ["SOFT", "WONK"] });

export const metadata: Metadata = {
  title: { default: "ApnaGhar — Property listings", template: "%s · ApnaGhar" },
  description: "Search verified property listings and contact agents directly.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applied before paint so a dark-mode user never sees a light flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${fraunces.variable} min-h-screen`}>
        <ToastProvider>
          <Navbar user={user ? { id: user.id, name: user.name, role: user.role } : null} />
          <main>{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
