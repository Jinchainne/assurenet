import type { Metadata } from "next";
import "./globals.css";
import "./accessibility.css";

export const metadata: Metadata = {
  title: "AssureNet — Work with proof",
  description: "Consensus-backed delivery escrow on GenLayer",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
