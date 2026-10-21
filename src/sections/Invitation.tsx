import { useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { MapPin } from "@phosphor-icons/react";
import { couple, invitation, venue, wedding } from "../data/wedding";
import { KolamDivider, Lamp } from "../components/art/Ornaments";
import { Pendulum3D, PurnaKumbham, TempleBell } from "../components/art/Ornaments3D";
import { Pillar } from "../components/art/Temple";
import { Thoranam } from "../components/art/Thoranam";
import { ScratchReveal } from "../components/ScratchReveal";
import { useReducedMotion } from "../hooks/useReducedMotion";
import "./Invitation.css";

const MUHURTHAM = new Date(wedding.muhurthamISO);

/**
 * One part of the muhurtham, formatted in Madurai time — a guest
 * opening the card abroad must still see the hour that is printed on
 * the paper invitation, not that hour converted to their own clock.
 */
function muhurtham(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", ...options }).format(
    MUHURTHAM,
  );
}

const WHEN = {
  weekday: muhurtham({ weekday: "long" }),
  day: muhurtham({ day: "numeric" }),
  monthYear: muhurtham({ month: "long", year: "numeric" }),
  time: muhurtham({ hour: "numeric", minute: "2-digit" }),
};

/** The date as a sentence, for screen readers once the foil is gone. */
const WHEN_SPOKEN = `The wedding is on ${WHEN.weekday}, ${WHEN.day} ${WHEN.monthYear}${
  wedding.muhurthamTimeFixed ? `, at ${WHEN.time}` : ""
}.`;

const PETAL_COLORS = ["#f08a1c", "#f7b928", "#fffaf0", "#c8102e"];

/** Marigold, jasmine and rose petals thrown up from the foil when it comes away. */
function PetalShower() {
  const [petals] = useState(() =>
    Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 90 + Math.random() * 120;
      return {
        id: i,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        style: {
          "--dx": `${Math.cos(angle) * distance}px`,
          "--dy": `${Math.sin(angle) * distance * 0.6 - 50}px`,
          "--fall": `${90 + Math.random() * 110}px`,
          "--spin": `${Math.random() * 540 - 270}deg`,
          "--size": `${8 + Math.random() * 7}px`,
          animationDelay: `${Math.random() * 0.15}s`,
        } as CSSProperties,
      };
    }),
  );

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="petals__petal"
          style={{ ...petal.style, background: petal.color }}
        />
      ))}
    </div>
  );
}

export function Invitation() {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const { groom, bride } = couple;

  return (
    <section id="invitation" className="invitation" aria-labelledby="invitation-title">
      {/* the hall the card hangs in */}
      <Pillar className="invitation__pillar invitation__pillar--left" />
      <Pillar className="invitation__pillar invitation__pillar--right" />
      <Pendulum3D className="invitation__bell invitation__bell--left" duration={6.5} range={7}>
        <TempleBell />
      </Pendulum3D>
      <Pendulum3D className="invitation__bell invitation__bell--right" duration={8.2} range={5}>
        <TempleBell />
      </Pendulum3D>

      <motion.article
        className="card"
        initial={reduced ? false : { opacity: 0, y: 48, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* manjal and kungumam pressed onto the four corners, as on every
            invitation that leaves a Tamil home */}
        <span className="card__tilak card__tilak--tl" aria-hidden="true" />
        <span className="card__tilak card__tilak--tr" aria-hidden="true" />
        <span className="card__tilak card__tilak--bl" aria-hidden="true" />
        <span className="card__tilak card__tilak--br" aria-hidden="true" />

        <div className="card__paper">
          <Thoranam className="card__thoranam" leaves={15} />

          {/* the purna kumbham between two lit lamps, set out to begin anything auspicious */}
          <div className="card__invocation" aria-hidden="true">
            <Lamp className="card__lamp" />
            <PurnaKumbham className="card__kumbham" />
            <Lamp className="card__lamp" />
          </div>

          <p className="card__heading">{invitation.heading}</p>

          <p className="card__invite">{wedding.invitationLine}</p>

          <h1 id="invitation-title" className="card__names">
            <span className="script card__name">{groom.firstName}</span>
            <span className="card__weds">weds</span>
            <span className="script card__name">{bride.firstName}</span>
          </h1>

          <KolamDivider className="card__divider" />

          <div className="card__block">
            <p className="eyebrow card__eyebrow">Save the Date</p>

            <div className="card__scratch">
              <ScratchReveal
                className="card__foil"
                label="Scratch to reveal the date"
                revealedText={WHEN_SPOKEN}
                onReveal={() => setRevealed(true)}
              >
                <p className="card__date">
                  <span className="card__date-weekday">{WHEN.weekday}</span>
                  <span className="card__date-day">{WHEN.day}</span>
                  <span className="card__date-month">{WHEN.monthYear}</span>
                  {wedding.muhurthamTimeFixed && (
                    <span className="card__date-time">{WHEN.time}</span>
                  )}
                </p>
              </ScratchReveal>
              {revealed && !reduced && <PetalShower />}
            </div>
          </div>

          <KolamDivider className="card__divider" />

          <div className="card__block">
            <p className="eyebrow card__eyebrow">Venue</p>
            <h2 className="card__venue">{venue.name}</h2>
            {venue.addressLines.length > 0 && (
              <address className="card__address">
                {venue.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            )}
            <a
              className="card__maps"
              href={venue.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              <MapPin size={20} weight="fill" aria-hidden="true" />
              Open in Google Maps
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>

          <p className="script card__closing">{invitation.closing}</p>
        </div>
      </motion.article>
    </section>
  );
}
