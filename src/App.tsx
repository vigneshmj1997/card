import { TempleEntrance } from "./sections/TempleEntrance";
import { Invitation } from "./sections/Invitation";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#invitation">
        Skip to the invitation
      </a>

      <main id="main">
        {/* Walk in through the gopuram; the card is waiting in the hall. */}
        <TempleEntrance />
        <Invitation />
      </main>
    </>
  );
}
