import type { Metadata } from "next";
import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metrics & Measurement | Jungle",
  description: "CRUD-manageable internal hub for Jungle lead source, lifecycle, scoring, and movement rules."
};

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/lead-sources", label: "Lead Sources" },
  { href: "/lifecycle-stages", label: "Lifecycle Stages" },
  { href: "/lead-scoring", label: "Lead Scoring Model" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <nav className="topNav" aria-label="Metrics & Measurement navigation">
          <Link href="/" className="navLogo">
            Jungle <span>× Metrics & Measurement</span>
          </Link>
          <div className="navTabs">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
