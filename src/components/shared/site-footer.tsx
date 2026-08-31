import Image from "next/image";
import Link from "next/link";
import { Workflow } from "lucide-react";

const footerLinks = [
  { href: "/", label: "Workspace" },
  { href: "/templates", label: "Templates" },
  // { href: "/gallery", label: "Gallery" },
  // { href: "/pricing", label: "Pricing" },
  // { href: "/roadmap", label: "Roadmap" },
  { href: "/workflow", label: "What's next" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#060a12]/75">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3 text-white">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl">
              <Image
                src="/berrybox.png"
                alt="BerryBox logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-black">BerryBox</span>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            A little space for big game ideas. Templates and the 3D builder are
            in alpha. Character creation and the connected workflow are coming soon.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-400">
            <Workflow className="h-4 w-4" />
            Made for creators
          </span>
        </div>
      </div>
    </footer>
  );
}

