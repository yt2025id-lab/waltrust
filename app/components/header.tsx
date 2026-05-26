"use client";

import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";
import { useState, useCallback } from "react";
import { Shield, Menu, X } from "lucide-react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navLinks = [
    { href: "/", label: "Verify", tag: "01" },
    { href: "/issue", label: "Issue", tag: "02" },
    { href: "/wallet", label: "Wallet", tag: "03" },
    { href: "/revoke", label: "Revoke", tag: "04" },
    { href: "/admin", label: "Admin", tag: "05" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-neo-border bg-neo-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-neo-green border-[3px] border-neo-border rounded-neo
              flex items-center justify-center shadow-neo-sm
              group-hover:shadow-neo-hover group-hover:-translate-y-0.5
              transition-all duration-200">
              <Shield className="w-5 h-5 text-neo-text" strokeWidth={3} />
            </div>
            <div className="flex items-baseline">
              <span className="font-display font-800 text-xl tracking-tight text-neo-text">Wal</span>
              <span className="font-display font-800 text-xl tracking-tight text-neo-green">Trust</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative flex items-center gap-2 px-4 py-2
                  font-mono text-sm font-bold uppercase tracking-wider
                  border-[2px] border-transparent
                  hover:border-neo-border hover:bg-neo-surface hover:shadow-neo-sm
                  rounded-neo transition-all duration-200"
              >
                <span className="text-neo-text3 text-[10px]">{link.tag}</span>
                <span className="text-neo-text">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="neo-tag-green text-[9px]">LIVE</span>
              <span className="neo-tag-yellow text-[9px]">MAINNET</span>
            </div>
            <div className="[&_button]:!bg-neo-surface [&_button]:!border-[3px] [&_button]:!border-neo-border
              [&_button]:!rounded-neo [&_button]:!shadow-neo-sm [&_button]:!font-mono [&_button]:!text-xs
              [&_button]:!font-bold [&_button]:!uppercase [&_button]:!tracking-wider
              [&_button]:hover:!shadow-neo-hover [&_button]:hover:!-translate-y-0.5
              [&_button]:!transition-all [&_button]:!duration-200">
              <ConnectButton />
            </div>
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center
                border-[3px] border-neo-border rounded-neo bg-neo-surface shadow-neo-sm"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden pb-4 flex flex-col gap-1 border-t-[3px] border-neo-border pt-3"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3
                  font-mono text-sm font-bold uppercase tracking-wider
                  border-[2px] border-neo-border rounded-neo bg-neo-surface shadow-neo-sm
                  hover:shadow-neo-hover hover:-translate-y-0.5 transition-all"
              >
                <span className="text-neo-green text-[10px]">{link.tag}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
