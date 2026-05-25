"use client";

import { usePathname } from "next/navigation";
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
      <a href="/" className="navbar__logo" data-cursor="hover">DA</a>

      {/* Desktop links */}
      <ul className="navbar__links">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="navbar__link nav-link-item"
              style={isActive(link.href) ? { color: "var(--text)" } : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <a href="/contact" className="navbar__cta navbar__cta--desktop" data-cursor="hover">Let&apos;s Talk →</a>

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
              <a
                href={link.href}
                className={`navbar__mobile-link ${isActive(link.href) ? "active" : ""}`}
                onClick={closeMenu}
                data-cursor="hover"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="/contact" className="navbar__cta navbar__cta--mobile" onClick={closeMenu} data-cursor="hover">
          Let&apos;s Talk →
        </a>
        <div className="navbar__mobile-footer">
          <a href="#" data-cursor="hover">LinkedIn</a>
          <a href="#" data-cursor="hover">Behance</a>
          <a href="#" data-cursor="hover">Email</a>
        </div>
      </div>
    </nav>
  );
}
