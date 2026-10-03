import type { Metadata, Viewport } from "next";
import { Azeret_Mono, Bricolage_Grotesque, Geologica } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { MODE_SCRIPT } from "@/lib/mode-script";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Speaks: headlines. Reads: body, with Greek for σ μ x̄. Measures: numbers. See DESIGN.md.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});
const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin", "greek"],
  display: "swap",
});
// Plain zero, so 0 never reads as 8 at label size. Greek falls back to Geologica.
const azeret = Azeret_Mono({
  variable: "--font-num",
  subsets: ["latin"],
  display: "swap",
});

// Social cards and canonical links need an absolute URL; it lives in lib/seo.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: business statistics, one idea at a time`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Thirteen topics of business statistics. Each one has a plain sentence, a real example, something to drag, and timed drills with fresh numbers until it sticks.",
  openGraph: {
    title: SITE_NAME,
    description: "Drop enough grains and the shape appears. Business statistics, one idea at a time.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME}: drop enough grains and the shape appears.` }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  // Listed explicitly: an icons object replaces the automatic app/icon.svg link, so the favicon must be named here.
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#130e0c" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geologica.variable} ${azeret.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        {/* Vercel Web Analytics: anonymous page counts, no cookies. Inactive until enabled in the Vercel project. */}
        <Analytics />
      </body>
    </html>
  );
}
