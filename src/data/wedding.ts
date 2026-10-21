/* ============================================================
   ⚠️  EDIT THIS FILE — it is the single source of truth for the
   whole site. Every name, date, venue and story beat below is
   SAMPLE CONTENT. Replace it with the real details.
   Nothing else in the codebase hardcodes wedding copy.
   ============================================================ */

export interface Person {
  firstName: string;
  fullName: string;
  /** Short bio shown on the portrait card. Keep to ~2 sentences. */
  bio: string;
  /** Parents' line, as printed on a South Indian invitation. */
  parents: string;
  /** Public path to a portrait image. See /public/portraits/README.md */
  portrait: string;
  /** Alt text for the portrait. */
  portraitAlt: string;
}

export interface WeddingEvent {
  id: string;
  name: string;
  /** Tamil / Sanskrit name of the ritual, shown as a subtitle. */
  nativeName: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  dressCode: string;
  /** Drives the accent colour of the event card. */
  hue: "marigold" | "purple" | "green" | "gold";
}

export interface StoryChapter {
  id: string;
  year: string;
  title: string;
  body: string;
  /** Which illustrated vignette to render beside this chapter. */
  scene: "meeting" | "temple" | "coast" | "proposal";
}

export const couple = {
  bride: {
    firstName: "Shalini",
    // Add surnames when you want them — the portrait card renders
    // whatever is here, and first names alone read fine.
    fullName: "Shalini",
    bio: "A Bharatanatyam dancer who keeps a notebook of every filter coffee she has ever loved. She laughs before the punchline, every single time.",
    parents: "Daughter of Mr. & Mrs. —",
    portrait: "/portraits/bride.jpg",
    portraitAlt: "Shalini in a purple silk saree with gold jhumkas",
  } satisfies Person,

  groom: {
    firstName: "Vignesh",
    fullName: "Vignesh",
    bio: "An engineer who builds things at night and swears he will sleep early tomorrow. He plans holidays like migrations — carefully, and with a rollback.",
    parents: "Son of Mr. & Mrs. —",
    portrait: "/portraits/groom.jpg",
    portraitAlt: "Vignesh smiling by the waterfront at night",
  } satisfies Person,
};

export const wedding = {
  /** Shown in the hero and the browser tab. */
  hashtag: "#ShaliniAndVignesh",
  /** ISO date of the muhurtham — the date under the foil on the card. */
  muhurthamISO: "2026-11-13T00:00:00+05:30",
  /**
   * Whether the hour in muhurthamISO is the real one. Leave false until
   * the muhurtham time is fixed — the card then shows the date alone.
   */
  muhurthamTimeFixed: false,
  dateLabel: "13 November 2026",
  city: "Madurai, Tamil Nadu",
  invitationLine:
    "Together with their families, we invite you to share in the joy of our wedding.",
  /** Tamil blessing printed under the hero. Rendered with lang="ta". */
  blessing: "வாழ்க வளமுடன்",
  blessingTranslit: "Vaazhga Valamudan — may you live in abundance",
};

/** Wording printed on the invitation card and at the temple gate. */
export const invitation = {
  /** Greeting over the gopuram before you step inside. */
  welcome: "Welcome",
  welcomeLine: "Please step inside",
  /** Heading at the top of the card, under the kumbham and lamps. */
  heading: "Wedding Invitation",
  /** Last line on the card. */
  closing: "We look forward to celebrating with you",
};

export const story: StoryChapter[] = [
  {
    id: "met",
    year: "2019",
    title: "A queue that took too long",
    body: "We met in the world's slowest filter coffee queue at a wedding neither of us wanted to attend. By the time the coffee arrived it was cold, and we had already talked for an hour.",
    scene: "meeting",
  },
  {
    id: "temple",
    year: "2021",
    title: "Meenakshi Amman, at dawn",
    body: "A trip home turned into a 5am walk through the temple corridors. Somewhere between the thousand pillars, this stopped feeling like a friendship.",
    scene: "temple",
  },
  {
    id: "coast",
    year: "2023",
    title: "Three hundred kilometres of coast",
    body: "One rented car, a broken aux cable, and the whole East Coast Road. We sang badly for six hours and decided we could do this for a very long time.",
    scene: "coast",
  },
  {
    id: "yes",
    year: "2026",
    title: "And then, a yes",
    body: "No drone, no flash mob. Just a terrace, two cups of tea going cold again, and a question that took nine seconds to answer.",
    scene: "proposal",
  },
];

export const events: WeddingEvent[] = [
  {
    id: "nichayathartham",
    name: "Engagement",
    nativeName: "Nichayathartham",
    date: "Monday, 16 November 2026",
    time: "10:00 AM onwards",
    venue: "Sri Meenakshi Mahal, Madurai",
    description:
      "The families meet, the date is read aloud, and the promise is made official over sweets and far too many photographs.",
    dressCode: "Traditional — silks and pastels",
    hue: "gold",
  },
  {
    id: "mehendi",
    name: "Mehendi & Sangeet",
    nativeName: "Mailanchi",
    date: "Tuesday, 17 November 2026",
    time: "4:00 PM onwards",
    venue: "The Courtyard, Sri Meenakshi Mahal",
    description:
      "Henna, a live nadaswaram set, and a dance floor that our cousins have been rehearsing for since March.",
    dressCode: "Bright and comfortable — greens and yellows",
    hue: "green",
  },
  {
    id: "haldi",
    name: "Haldi & Kashi Yatra",
    nativeName: "Manjal Neerattu Vizha",
    date: "Wednesday, 18 November 2026",
    time: "7:30 AM onwards",
    venue: "Family home, Anna Nagar, Madurai",
    description:
      "Turmeric, blessings, and the traditional mock pilgrimage where the groom is talked out of renouncing worldly life.",
    dressCode: "Yellow — and nothing you mind staining",
    hue: "marigold",
  },
  {
    id: "muhurtham",
    name: "The Wedding",
    nativeName: "Muhurtham",
    date: "Thursday, 19 November 2026",
    time: "9:40 AM — auspicious hour",
    venue: "Sri Meenakshi Mahal, Madurai",
    description:
      "The thaali is tied within the muhurtham hour. Please be seated by 9:15 AM — the sastrigal does not wait, and neither does the hour.",
    dressCode: "Full traditional — kanjeevaram and veshti",
    hue: "purple",
  },
  {
    id: "reception",
    name: "Reception",
    nativeName: "Vaibhogame",
    date: "Thursday, 19 November 2026",
    time: "7:00 PM onwards",
    venue: "The Grand Lawn, Heritage Madurai",
    description:
      "Dinner, a very long stage queue, and the part of the night where the playlist finally gets good.",
    dressCode: "Indian formal",
    hue: "purple",
  },
];

export const venue = {
  name: "G.R.K. Thirumana Mandapam",
  /** Street address, one line per entry. The card hides it while empty. */
  addressLines: [] as string[],
  mapsUrl: "https://maps.app.goo.gl/L8RPCaHL1ks1DcJj9",
  travelNotes: [
    {
      id: "air",
      title: "By air",
      body: "Madurai Airport (IXM) is 45 minutes from the mahal. Chennai (MAA) is a 90-minute connecting flight.",
    },
    {
      id: "rail",
      title: "By rail",
      body: "Madurai Junction is 10 minutes away. The Vaigai and Pandian expresses both arrive early morning.",
    },
    {
      id: "stay",
      title: "Where to stay",
      body: "Rooms are blocked at Heritage Madurai and Hotel Sangam. Mention the wedding when you book.",
    },
  ],
};

/** Gallery images. Drop files into /public/gallery/ and list them here. */
export const gallery = [
  { src: "/gallery/01.jpg", alt: "The couple at the temple corridor" },
  { src: "/gallery/02.jpg", alt: "Filter coffee on a morning terrace" },
  { src: "/gallery/03.jpg", alt: "The East Coast Road at sunset" },
  { src: "/gallery/04.jpg", alt: "Mehendi on the bride's hands" },
  { src: "/gallery/05.jpg", alt: "The families together after the engagement" },
  { src: "/gallery/06.jpg", alt: "Fireworks over the water" },
];

export const rsvp = {
  deadlineLabel: "Please respond by 30 September 2026",
  /**
   * Where the RSVP form posts. Leave empty to keep the demo-only
   * behaviour (validates, then shows a success state without sending).
   * Drop in a Formspree / Google Form / API endpoint to go live.
   */
  endpoint: "",
  contactEmail: "hello@example.com",
  contactPhone: "+91 90000 00000",
};

export const nav = [
  { id: "story", label: "Our Story" },
  { id: "couple", label: "The Couple" },
  { id: "events", label: "Celebrations" },
  { id: "gallery", label: "Gallery" },
  { id: "venue", label: "Travel" },
  { id: "rsvp", label: "RSVP" },
];
