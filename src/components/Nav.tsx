import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "@phosphor-icons/react";
import { nav, couple } from "../data/wedding";
import "./Nav.css";

/**
 * Sticky navigation.
 *
 * The active section is tracked with an IntersectionObserver rather than
 * scroll maths — cheaper, and it stays correct when sections have wildly
 * different heights (the hero is nearly two viewports tall).
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        // The section occupying the most of the viewport band wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Close the sheet on Escape — every dismissible overlay needs an
  // escape route that is not a mouse click.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <motion.header
      className={`nav ${scrolled ? "nav--solid" : ""}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav__inner container">
        <a className="nav__brand script" href="#top">
          {couple.bride.firstName[0]} &amp; {couple.groom.firstName[0]}
        </a>

        <nav className="nav__desktop" aria-label="Sections">
          <ul className="nav__list">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  className={`nav__link ${active === item.id ? "is-active" : ""}`}
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="nav__toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="nav-sheet"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? (
            <X size={24} weight="bold" aria-hidden="true" />
          ) : (
            <List size={24} weight="bold" aria-hidden="true" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="nav-sheet"
            className="nav__sheet"
            aria-label="Sections"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            // Exit runs faster than enter so dismissal feels responsive.
            exit={{ opacity: 0, y: -12, transition: { duration: 0.16 } }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="nav__sheet-list">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    className={`nav__sheet-link ${active === item.id ? "is-active" : ""}`}
                    href={`#${item.id}`}
                    aria-current={active === item.id ? "true" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
