import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const productLinks = [
  { href: "/templates", label: "Templates" },
  { href: "/editor?template=explorer&new=1", label: "AI Builder" },
  { href: "/characters", label: "Character Creator" },
  { href: "/workflow", label: "Connected Workflow" },
];

const exploreLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#workspace", label: "Workspace" },
  { href: "/#showcase", label: "Showcase" },
  { href: "/#access", label: "Access" },
  { href: "/#roadmap", label: "Roadmap" },
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
        <div className="bb-footer-links"><p>CREATE</p><Link href="/editor?template=explorer&new=1">Open builder <ArrowUpRight size={13} /></Link><Link href="/templates">Choose a template <ArrowUpRight size={13} /></Link></div>
      </div>
      <div className="bb-footer-bottom">
        <span>© {new Date().getFullYear()} BERRYBOX</span>
        <span>BUILD THE WORLD · PLAY THE IDEA</span>
        <Link href="/">BACK TO TOP ↑</Link>
      </div>
    </footer>
  );
}
