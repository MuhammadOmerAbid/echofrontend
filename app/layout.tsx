import type { Metadata } from "next";
import { Poppins, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

/* Poppins — headings, hero text (matches the reference exactly) */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

/* DM Sans — body text, labels, UI chrome */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

/* DM Serif Display — logo wordmark only */
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Echo — Student Voice Platform",
  description:
    "An anonymous suggestion platform for campuses. Students say what they think, institutions see the pattern.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
