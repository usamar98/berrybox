"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/#workspace", label: "Workspace" },
  { href: "/templates", label: "Templates" },
  { href: "/#access", label: "Access" },
  { href: "/#roadmap", label: "Roadmap" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bb-site-header">
      <div className="bb-header-inner">
        <Link href="/" className="bb-logo" aria-label="BerryBox home">
          <span className="bb-logo-icon">
            <Image src="/berrybox.png" alt="BerryBox logo" width={34} height={34} priority />
          </span>
          <span>BerryBox</span>
        </Link>

        <nav className="bb-desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href === "/templates" && pathname === "/templates" ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="bb-header-action">
          <Link href="/editor?template=explorer&new=1" className="bb-header-cta">
            Start building <ArrowRight size={14} />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="bb-menu-button"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {open ? (
        <div className="bb-mobile-nav">
          <div>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/editor?template=explorer&new=1" onClick={() => setOpen(false)} className="bb-header-cta">
              Start building <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
