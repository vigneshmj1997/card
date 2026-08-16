import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Hero } from "./sections/Hero";
import { Story } from "./sections/Story";
import { Couple } from "./sections/Couple";
import { Events } from "./sections/Events";
import { Gallery } from "./sections/Gallery";
import { Venue } from "./sections/Venue";
import { Rsvp } from "./sections/Rsvp";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <span id="top" />
      <Nav />

      <main id="main">
        <Hero />
        <Story />
        <Couple />
        <Events />
        <Gallery />
        <Venue />
        <Rsvp />
      </main>

      <Footer />
    </>
  );
}
