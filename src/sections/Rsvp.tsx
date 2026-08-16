import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Warning, Envelope, Phone } from "@phosphor-icons/react";
import { rsvp, events, wedding } from "../data/wedding";
import { SectionHeading } from "../components/SectionHeading";
import { Marigold } from "../components/art/Ornaments";
import { GiftTray, ScrollTilt3D, Sway3D } from "../components/art/Ornaments3D";
import "./Rsvp.css";

/**
 * The RSVP form.
 *
 * Validation contract:
 *   - fields validate on blur, never on keystroke
 *   - each error sits below its field and is wired with aria-describedby
 *   - a failed submit renders a focusable summary at the top that links
 *     to each invalid field, and moves focus there
 *   - inline field errors are retained alongside the summary
 */

type Attendance = "joyfully" | "regretfully";

interface FormState {
  name: string;
  email: string;
  phone: string;
  attendance: Attendance | "";
  guests: string;
  ceremonies: string[];
  note: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  attendance: "",
  guests: "1",
  ceremonies: [],
  note: "",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Full name",
  email: "Email address",
  attendance: "Will you be joining us",
  guests: "Number of guests",
};

function validate(values: FormState): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) {
    errors.name = "Enter the name your invitation was addressed to.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter an email address so we can send you updates.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "That email address looks incomplete — check for a typo.";
  }

  if (!values.attendance) {
    errors.attendance = "Let us know whether you can make it.";
  }

  if (values.attendance === "joyfully") {
    const n = Number(values.guests);
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      errors.guests = "Enter a number between 1 and 10.";
    }
  }

  return errors;
}

export function Rsvp() {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );

  const summaryRef = useRef<HTMLDivElement>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear a resolved error as the user fixes it, but never introduce a
    // new one mid-keystroke.
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  }

  function handleBlur(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }));
    const fieldErrors = validate(values);
    setErrors((e) => ({ ...e, ...(fieldErrors[key] ? { [key]: fieldErrors[key] } : {}) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const found = validate(values);
    setErrors(found);
    setTouched(
      Object.keys(FIELD_LABELS).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
    );

    if (Object.keys(found).length > 0) {
      // Move focus to the summary so the failure is announced and the
      // list of problems is the next thing a keyboard user reads.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus("sending");

    if (!rsvp.endpoint) {
      // Demo mode — no endpoint configured, so acknowledge locally.
      window.setTimeout(() => setStatus("sent"), 700);
      return;
    }

    try {
      const response = await fetch(rsvp.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });
      setStatus(response.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <section id="rsvp" className="rsvp" aria-labelledby="rsvp-heading">
        <div className="container container-narrow">
          <motion.div
            className="rsvp__success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Sway3D className="rsvp__success-tray" duration={8} range={26}>
              <GiftTray />
            </Sway3D>
            <Marigold className="rsvp__success-flower" />
            <h2 id="rsvp-heading" className="script rsvp__success-title">
              Thank you
            </h2>
            <p className="rsvp__success-body">
              {values.attendance === "joyfully"
                ? `We have you down for ${values.guests} — see you in Madurai.`
                : "We will miss you, but thank you for telling us."}
            </p>
            <button
              type="button"
              className="rsvp__reset"
              onClick={() => {
                setValues(EMPTY);
                setTouched({});
                setStatus("idle");
              }}
            >
              Submit another response
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  const errorList = Object.entries(errors).filter(([, v]) => Boolean(v));
  const showSummary = errorList.length > 0 && Object.keys(touched).length > 0;

  return (
    <section id="rsvp" className="rsvp" aria-labelledby="rsvp-heading">
      <div className="container container-narrow">
        <SectionHeading
          id="rsvp-heading"
          eyebrow={rsvp.deadlineLabel}
          title="RSVP"
          lead={`One form per invitation. ${wedding.hashtag} if you post anything.`}
        />

        <form className="rsvp__form" onSubmit={handleSubmit} noValidate>
          {showSummary && (
            <div
              ref={summaryRef}
              className="rsvp__summary"
              role="alert"
              tabIndex={-1}
            >
              <p className="rsvp__summary-title">
                <Warning size={20} weight="fill" aria-hidden="true" />
                There {errorList.length === 1 ? "is 1 problem" : `are ${errorList.length} problems`} with this form
              </p>
              <ul className="rsvp__summary-list">
                {errorList.map(([key, message]) => (
                  <li key={key}>
                    <a href={`#rsvp-${key}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Field
            id="rsvp-name"
            label={FIELD_LABELS.name}
            required
            error={touched.name ? errors.name : undefined}
          >
            <input
              id="rsvp-name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              aria-invalid={touched.name && Boolean(errors.name)}
              aria-describedby={
                touched.name && errors.name ? "rsvp-name-error" : undefined
              }
            />
          </Field>

          <div className="rsvp__row">
            <Field
              id="rsvp-email"
              label={FIELD_LABELS.email}
              required
              error={touched.email ? errors.email : undefined}
            >
              <input
                id="rsvp-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={touched.email && Boolean(errors.email)}
                aria-describedby={
                  touched.email && errors.email ? "rsvp-email-error" : undefined
                }
              />
            </Field>

            <Field id="rsvp-phone" label="Phone" hint="Optional">
              <input
                id="rsvp-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </Field>
          </div>

          <fieldset
            className="rsvp__fieldset"
            aria-describedby={
              touched.attendance && errors.attendance
                ? "rsvp-attendance-error"
                : undefined
            }
          >
            <legend className="rsvp__legend">
              {FIELD_LABELS.attendance}?
              <span className="rsvp__required" aria-hidden="true">
                *
              </span>
              <span className="visually-hidden">(required)</span>
            </legend>

            <div className="rsvp__choices" id="rsvp-attendance">
              {(
                [
                  ["joyfully", "Joyfully accepting"],
                  ["regretfully", "Regretfully declining"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="rsvp__choice">
                  <input
                    type="radio"
                    name="attendance"
                    value={value}
                    checked={values.attendance === value}
                    onChange={() => {
                      setField("attendance", value);
                      setTouched((t) => ({ ...t, attendance: true }));
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {touched.attendance && errors.attendance && (
              <p className="rsvp__error" id="rsvp-attendance-error">
                <Warning size={16} weight="fill" aria-hidden="true" />
                {errors.attendance}
              </p>
            )}
          </fieldset>

          {/* Guest count and ceremony picker only matter to those coming —
              revealed rather than shown upfront. */}
          {values.attendance === "joyfully" && (
            <motion.div
              className="rsvp__conditional"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Field
                id="rsvp-guests"
                label={FIELD_LABELS.guests}
                hint="Including yourself"
                required
                error={touched.guests ? errors.guests : undefined}
              >
                <input
                  id="rsvp-guests"
                  name="guests"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  value={values.guests}
                  onChange={(e) => setField("guests", e.target.value)}
                  onBlur={() => handleBlur("guests")}
                  aria-invalid={touched.guests && Boolean(errors.guests)}
                  aria-describedby={
                    touched.guests && errors.guests
                      ? "rsvp-guests-error"
                      : "rsvp-guests-hint"
                  }
                />
              </Field>

              <fieldset className="rsvp__fieldset">
                <legend className="rsvp__legend">
                  Which will you be at?
                  <span className="rsvp__legend-hint">Tick all that apply</span>
                </legend>
                <div className="rsvp__checks">
                  {events.map((event) => (
                    <label key={event.id} className="rsvp__choice">
                      <input
                        type="checkbox"
                        name="ceremonies"
                        value={event.id}
                        checked={values.ceremonies.includes(event.id)}
                        onChange={(e) =>
                          setField(
                            "ceremonies",
                            e.target.checked
                              ? [...values.ceremonies, event.id]
                              : values.ceremonies.filter((c) => c !== event.id),
                          )
                        }
                      />
                      <span>{event.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </motion.div>
          )}

          <Field
            id="rsvp-note"
            label="Anything we should know"
            hint="Dietary needs, travel dates, a song request"
          >
            <textarea
              id="rsvp-note"
              name="note"
              rows={4}
              value={values.note}
              onChange={(e) => setField("note", e.target.value)}
            />
          </Field>

          {status === "failed" && (
            <p className="rsvp__error rsvp__error--submit" role="alert">
              <Warning size={18} weight="fill" aria-hidden="true" />
              We could not send that. Check your connection and try again, or
              email us at {rsvp.contactEmail}.
            </p>
          )}

          <button
            type="submit"
            className="rsvp__submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? (
              <>
                <span className="rsvp__spinner" aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                <CheckCircle size={20} weight="fill" aria-hidden="true" />
                Send our response
              </>
            )}
          </button>

          <div className="rsvp__tray">
            <ScrollTilt3D className="rsvp__tray-art" range={38}>
              <GiftTray />
            </ScrollTilt3D>
            <p className="rsvp__tray-note">
              A thamboolam goes home with every guest. Your presence is the
              only thing we are actually asking for.
            </p>
          </div>

          <p className="rsvp__contact">
            Rather just call?{" "}
            <a href={`mailto:${rsvp.contactEmail}`}>
              <Envelope size={16} weight="fill" aria-hidden="true" />
              {rsvp.contactEmail}
            </a>{" "}
            <a href={`tel:${rsvp.contactPhone.replace(/\s/g, "")}`}>
              <Phone size={16} weight="fill" aria-hidden="true" />
              {rsvp.contactPhone}
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   Field wrapper — visible label, persistent hint, error below
   ------------------------------------------------------------------ */

function Field({
  id,
  label,
  hint,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rsvp__field ${error ? "rsvp__field--invalid" : ""}`}>
      <label className="rsvp__label" htmlFor={id}>
        {label}
        {required && (
          <>
            <span className="rsvp__required" aria-hidden="true">
              *
            </span>
            <span className="visually-hidden">(required)</span>
          </>
        )}
      </label>

      {hint && (
        <p className="rsvp__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}

      {children}

      {error && (
        <p className="rsvp__error" id={`${id}-error`}>
          <Warning size={16} weight="fill" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
