import { motion } from "framer-motion";
import { AirplaneTilt, Train, Buildings, NavigationArrow } from "@phosphor-icons/react";
import { venue } from "../data/wedding";
import { SectionHeading } from "../components/SectionHeading";
import { Gopuram } from "../components/art/Ornaments";
import { Mandapam, ScrollTilt3D } from "../components/art/Ornaments3D";
import "./Venue.css";

const TRAVEL_ICONS = {
  air: AirplaneTilt,
  rail: Train,
  stay: Buildings,
} as const;

export function Venue() {
  return (
    <section id="venue" className="venue" aria-labelledby="venue-heading">
      <div className="container">
        <SectionHeading
          id="venue-heading"
          eyebrow="Getting there"
          title="Travel & Stay"
          lead="Madurai in November is warm, loud, and worth the trip."
        />

        <div className="venue__layout">
          <motion.div
            className="venue__card"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Gopuram className="venue__gopuram" />

            <h3 className="venue__name">{venue.name}</h3>
            <address className="venue__address">
              {venue.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>

            <a
              className="venue__link"
              href={venue.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              <NavigationArrow size={18} weight="fill" aria-hidden="true" />
              Open in Maps
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </motion.div>

          <ul className="venue__notes">
            {venue.travelNotes.map((note, i) => {
              const Icon =
                TRAVEL_ICONS[note.id as keyof typeof TRAVEL_ICONS] ?? Buildings;
              return (
                <motion.li
                  key={note.id}
                  className="venue__note"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span className="venue__note-icon" aria-hidden="true">
                    <Icon size={24} weight="duotone" />
                  </span>
                  <div>
                    <h4 className="venue__note-title">{note.title}</h4>
                    <p className="venue__note-body">{note.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* The mandapam turns as you scroll past it, so you see it from
            more than one angle on the way down. */}
        <ScrollTilt3D className="venue__mandapam" range={42}>
          <Mandapam />
        </ScrollTilt3D>
        <p className="venue__mandapam-caption">
          The muhurtham is held under the mandapam, at the centre of the hall.
        </p>
      </div>
    </section>
  );
}
