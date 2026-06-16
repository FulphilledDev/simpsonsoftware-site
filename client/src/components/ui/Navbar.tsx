"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavbarProps {
  companyName: string;
  companyLogoUrl?: string | null;
  resumeUrl?: string | null;
}

const links = [
  { href: "/", label: "Home", exact: true },
  { href: "/projects", label: "Projects" },
  { href: "/book", label: "Book a Call" },
];

export default function Navbar({ companyName, companyLogoUrl, resumeUrl }: NavbarProps) {
  const pathname = usePathname();

  // Hide on all admin routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
          aria-label={companyName || "Home"}
        >
          {companyLogoUrl ? (
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={companyLogoUrl}
                alt={companyName}
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 flex items-center justify-center flex-shrink-0 border border-neon-cyan/20 group-hover:border-neon-cyan/50 transition-colors">
              <span className="text-xs font-black text-gradient-hero select-none leading-none">
                {companyName ? companyName[0] : "S"}
              </span>
            </div>
          )}
          <span className="text-sm font-bold text-white/85 group-hover:text-white transition-colors tracking-wide hidden sm:block">
            {companyName || "Simpson Software"}
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-neon-cyan bg-neon-cyan/[0.08] border border-neon-cyan/20"
                    : "text-white/50 hover:text-white/85 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* Resume download */}
          {resumeUrl && (
            <a
              href={resumeUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              title="Download Resume"
              aria-label="Download Resume"
              className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg border border-neon-cyan/20 text-neon-cyan/60 hover:text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/[0.06] transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
