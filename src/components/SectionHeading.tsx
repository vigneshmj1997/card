import { motion } from "framer-motion";
import { KolamDivider } from "./art/Ornaments";
import "./SectionHeading.css";

interface SectionHeadingProps {
  /** Wired to the section's aria-labelledby. */
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "center" | "start";
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  align = "center",
}: SectionHeadingProps) {
  return (
    <motion.header
      className={`section-heading section-heading--${align}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="script section-heading__title">
        {title}
      </h2>
      <KolamDivider className="section-heading__kolam" />
      {lead && <p className="section-heading__lead">{lead}</p>}
    </motion.header>
  );
}
