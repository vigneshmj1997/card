import { motion } from "framer-motion";
import {
  CalendarBlank,
  Clock,
  MapPin,
  TShirt,
} from "@phosphor-icons/react";
import { events, type WeddingEvent } from "../data/wedding";
import { SectionHeading } from "../components/SectionHeading";
import { BananaLeaf, Lamp } from "../components/art/Ornaments";
import { PurnaKumbham, Sway3D } from "../components/art/Ornaments3D";
import "./Events.css";

/**
 * The order of ceremonies. Cards lift and settle on scroll with a
 * staggered entrance — 60ms apart, which reads as a sequence without
 * making the last card feel late.
 */

function EventCard({ event, index }: { event: WeddingEvent; index: number }) {
  const details = [
    { id: "date", Icon: CalendarBlank, label: "Date", value: event.date },
    { id: "time", Icon: Clock, label: "Time", value: event.time },
    { id: "venue", Icon: MapPin, label: "Venue", value: event.venue },
    { id: "dress", Icon: TShirt, label: "Dress code", value: event.dressCode },
  ];

  return (
    <motion.li
      className={`event event--${event.hue}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="event__ribbon" aria-hidden="true">
        <span className="event__index">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="event__head">
        <h3 className="event__name">{event.name}</h3>
        {/* Romanised, not Tamil script — tagging it lang="ta" would make
            a screen reader switch to a Tamil voice and mangle it. */}
        <p className="event__native">{event.nativeName}</p>
      </div>

      <p className="event__description">{event.description}</p>

      <dl className="event__details">
        {details.map(({ id, Icon, label, value }) => (
          <div key={id} className="event__detail">
            <dt className="event__detail-label">
              {/* Icon sits beside a visible label, so it is decorative. */}
              <Icon
                className="event__icon"
                size={18}
                weight="duotone"
                aria-hidden="true"
              />
              {label}
            </dt>
            <dd className="event__detail-value">{value}</dd>
          </div>
        ))}
      </dl>
    </motion.li>
  );
}

export function Events() {
  return (
    <section id="events" className="events" aria-labelledby="events-heading">
      <BananaLeaf className="events__leaf events__leaf--left" />
      <BananaLeaf className="events__leaf events__leaf--right" />

      <div className="container">
        {/* The pair of kumbhams that would stand either side of a real
            entrance. Slightly different periods so the two never fall
            into lockstep and read as one animation. */}
        <div className="events__kumbhams">
          <Sway3D className="events__kumbham" duration={9} range={20}>
            <PurnaKumbham />
          </Sway3D>
          <Sway3D className="events__kumbham" duration={11.5} range={20}>
            <PurnaKumbham />
          </Sway3D>
        </div>

        <SectionHeading
          id="events-heading"
          eyebrow="Four days of it"
          title="The Celebrations"
          lead="Come for one, come for all of them. There will be food at every single one."
        />

        <ol className="events__grid">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </ol>

        <motion.p
          className="events__note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Lamp className="events__lamp" />
          <span>
            The muhurtham hour is fixed by the panchangam and cannot be moved.
            If you are choosing one event to be on time for, choose that one.
          </span>
        </motion.p>
      </div>
    </section>
  );
}
