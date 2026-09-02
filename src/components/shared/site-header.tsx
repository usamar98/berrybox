"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/ai-3d-scene-generator", label: "AI Scene Generator" },
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
              className={pathname === item.href ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="bb-header-action">
          <Link href="/ai-3d-scene-generator" className="bb-header-cta">
            Generate Scene <ArrowRight size={14} />
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
            <Link href="/ai-3d-scene-generator" onClick={() => setOpen(false)} className="bb-header-cta">
              Generate Scene <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
