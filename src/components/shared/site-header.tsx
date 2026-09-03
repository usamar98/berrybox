"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/ai-3d-scene-generator", label: "AI Scene Generator" },
  { href: "/ai-3d-character-generator", label: "AI Character Generator" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const characterPage = pathname === "/ai-3d-character-generator";
  const generatorHref = characterPage ? "/ai-3d-character-generator" : "/ai-3d-scene-generator";
  const generatorLabel = characterPage ? "Generate Character" : "Generate Scene";

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
          <Link href={generatorHref} className="bb-header-cta">
            {generatorLabel} <ArrowRight size={14} />
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
            <Link href={generatorHref} onClick={() => setOpen(false)} className="bb-header-cta">
              {generatorLabel} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
