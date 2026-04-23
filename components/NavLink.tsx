"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/$/, "") || "/";
  const isActive = href === "/" ? normalized === "/" : normalized.startsWith(href);

  return (
    <Link className={`navTab ${isActive ? "navTabActive" : ""}`} href={href}>
      {label}
    </Link>
  );
}
