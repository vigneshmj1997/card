import { couple, wedding, venue } from "../data/wedding";
import { KolamDivider, Lamp, Hills } from "./art/Ornaments";
import { Pendulum3D, TempleBell } from "./art/Ornaments3D";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <Hills className="footer__hills" />

      {/* Two bells hung from the top edge, swinging out of step — the
          periods are coprime enough that they never resynchronise. */}
      <Pendulum3D className="footer__bell footer__bell--left" duration={6.5} range={8}>
        <TempleBell />
      </Pendulum3D>
      <Pendulum3D className="footer__bell footer__bell--right" duration={8.2} range={6}>
        <TempleBell />
      </Pendulum3D>

      <div className="footer__inner container">
        <div className="footer__lamps" aria-hidden="true">
          <Lamp className="footer__lamp" />
          <Lamp className="footer__lamp footer__lamp--tall" />
          <Lamp className="footer__lamp" />
        </div>

        <p className="script footer__names">
          {couple.bride.firstName} &amp; {couple.groom.firstName}
        </p>

        <KolamDivider className="footer__kolam" />

        <p className="footer__meta">
          {wedding.dateLabel} · {venue.name}, {wedding.city}
        </p>

        <p className="footer__blessing" lang="ta">
          {wedding.blessing}
        </p>

        <p className="footer__hashtag">{wedding.hashtag}</p>
      </div>
    </footer>
  );
}
