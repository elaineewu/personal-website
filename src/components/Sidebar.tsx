"use client";

import { useState } from "react";
import SocialIcons from "./SocialIcons";
import TypewriterTagline from "./TypewriterTagline";

const TAGLINE =
  "Quant finance, data analysis, and the code behind both.";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Research", href: "#research" },
  { label: "Contact", href: "#contact" },
];

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <a
            href="#"
            className="font-mono text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-accent"
          >
            Elaine Wu
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="font-mono text-sm text-accent transition-colors hover:text-foreground"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            className="border-t border-border px-6 py-6"
            onClick={() => setMenuOpen(false)}
          >
            <ul className="flex flex-col gap-4">
              {navItems.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group flex items-center gap-3 font-mono text-sm tracking-wide text-muted transition-colors hover:text-accent"
                  >
                    <span className="text-accent opacity-60 group-hover:opacity-100">
                      —
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <SocialIcons className="mt-8" />
          </nav>
        )}
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[min(40vw,320px)] lg:flex-col lg:justify-between lg:px-12 lg:py-16 xl:px-16">
        <div>
          <a
            href="#"
            className="font-mono text-2xl font-semibold tracking-tight text-foreground transition-colors hover:text-accent"
          >
            Elaine Wu
          </a>
          <TypewriterTagline text={TAGLINE} />

          <nav className="mt-12" aria-label="Main navigation">
            <ul className="flex flex-col gap-3">
              {navItems.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group flex items-center gap-3 font-mono text-sm tracking-wide text-muted transition-colors hover:text-accent"
                  >
                    <span className="w-8 text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      —
                    </span>
                    <span className="group-hover:-translate-x-2 transition-transform duration-200">
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <SocialIcons />
      </aside>
    </>
  );
}
