import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const productLinks = [
  { href: "/ai-3d-scene-generator", label: "AI 3D Scene Generator" },
  { href: "/ai-3d-character-generator", label: "AI 3D Character Generator" },
  { href: "/workflow", label: "3D Game Generator" },
];

const exploreLinks = [
  { href: "/#features", label: "Features" },
];

export function SiteFooter() {
  return (
    <footer className="bb-site-footer">
      <div className="bb-footer-grid">
        <div className="bb-footer-brand">
          <div>
            <span><Image src="/berrybox.png" alt="BerryBox logo" width={36} height={36} /></span>
            <b>BerryBox</b>
          </div>
          <p>A focused workspace for turning small ideas into playable 3D worlds.</p>
          <small>EARLY ALPHA · BUILT FOR GAME CREATORS</small>
        </div>
        <div className="bb-footer-links"><p>PRODUCT</p>{productLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>
        <div className="bb-footer-links"><p>EXPLORE</p>{exploreLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>
        <div className="bb-footer-links"><p>CREATE</p><Link href="/ai-3d-scene-generator">Generate a 3D scene <ArrowUpRight size={13} /></Link><Link href="/ai-3d-character-generator">Generate a 3D character <ArrowUpRight size={13} /></Link><Link href="/#features">Explore creator tools <ArrowUpRight size={13} /></Link></div>
      </div>
      <div className="bb-footer-bottom">
        <span>© {new Date().getFullYear()} BERRYBOX</span>
        <span>BUILD THE WORLD · PLAY THE IDEA</span>
        <Link href="/">BACK TO TOP ↑</Link>
      </div>
    </footer>
  );
}
