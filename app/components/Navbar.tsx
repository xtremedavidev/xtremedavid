"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/projects") {
      return pathname === "/projects" || pathname.startsWith("/work");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <nav className="navbar" id="navbar">
      <Link href="/" className="navbar__logo" data-cursor="hover">DA</Link>

      {/* Desktop links */}
      <ul className="navbar__links">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="navbar__link nav-link-item"
              style={isActive(link.href) ? { color: "var(--text)" } : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/contact" className="navbar__cta navbar__cta--desktop" data-cursor="hover">Let&apos;s Talk →</Link>

      {/* Mobile hamburger */}
      <button
        className={`navbar__burger ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        data-cursor="hover"
      >
        <span /><span /><span />
      </button>

      {/* Mobile overlay */}
      <div className={`navbar__mobile ${menuOpen ? "navbar__mobile--open" : ""}`}>
        <ul className="navbar__mobile-links">
          {NAV_LINKS.map((link, i) => (
            <li key={link.href} style={{ transitionDelay: `${0.05 + i * 0.05}s` }}>
              <Link
                href={link.href}
                className={`navbar__mobile-link ${isActive(link.href) ? "active" : ""}`}
                onClick={closeMenu}
                data-cursor="hover"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/contact" className="navbar__cta navbar__cta--mobile" onClick={closeMenu} data-cursor="hover">
          Let&apos;s Talk →
        </Link>
        <div className="navbar__mobile-footer">
          <a href="https://www.linkedin.com/in/david-adebayo/" target="_blank" rel="noopener noreferrer" data-cursor="hover">LinkedIn</a>
          <a href="https://www.behance.net/xtremedavid" target="_blank" rel="noopener noreferrer" data-cursor="hover">Behance</a>
          <a href="mailto:davidadebayo702@gmail.com" data-cursor="hover">Email</a>
        </div>
      </div>
    </nav>
  );
}
