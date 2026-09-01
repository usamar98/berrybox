import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const productLinks = [
  { href: "/templates", label: "3D Template Generator" },
  { href: "/characters", label: "Character Creator" },
  { href: "/workflow", label: "3D Game Generator" },
];

const exploreLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#workspace", label: "Workspace" },
  { href: "/#sources", label: "Free Sources" },
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
        <div className="bb-footer-links"><p>CREATE</p><Link href="/templates">Generate a 3D template <ArrowUpRight size={13} /></Link><Link href="/characters">Character creator <ArrowUpRight size={13} /></Link></div>
      </div>
      <div className="bb-footer-bottom">
        <span>© {new Date().getFullYear()} BERRYBOX</span>
        <span>BUILD THE WORLD · PLAY THE IDEA</span>
        <Link href="/">BACK TO TOP ↑</Link>
      </div>
    </footer>
  );
}
