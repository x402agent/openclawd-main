import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "🦞 OpenClawd AutoResearch Wiki",
  description: "Self-improving knowledge engine for Solana blockchain and DeFi — 49 Metaplex Lobster Agents researching pump.fun, Birdeye, Helius, and autonomous trading.",
  metadataBase: new URL("https://solanaclawd.com"),
  openGraph: {
    title: "🦞 OpenClawd AutoResearch Wiki",
    description: "Self-improving knowledge engine for Solana blockchain and DeFi powered by 49 Metaplex Lobster Agents.",
    url: "https://solanaclawd.com",
    siteName: "OpenClawd AutoResearch",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "OpenClawd AutoResearch Wiki" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "🦞 OpenClawd AutoResearch Wiki",
    description: "Self-improving knowledge engine for Solana blockchain and DeFi.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="theme"
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
        {/* @ts-expect-error -- ElevenLabs ConvAI web component */}
        <elevenlabs-convai agent-id="agent_1601knpw2ax7ejb80fdxx118n7qn" />
        <Script
          src="https://unpkg.com/@elevenlabs/convai-widget-embed"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
