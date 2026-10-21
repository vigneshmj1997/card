import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import "./ScratchReveal.css";

interface ScratchRevealProps {
  /** What lies under the foil. */
  children: ReactNode;
  /** Printed on the foil, and the control's accessible name. */
  label: string;
  /** Announced to screen readers once the foil is gone. */
  revealedText: string;
  /** Fraction of the foil to clear before the rest falls away on its own. */
  threshold?: number;
  onReveal?: () => void;
  className?: string;
}

/**
 * Progress is measured on every Nth pixel. Prime, so the sample grid
 * never lines up with a straight brush stroke and over- or under-counts it.
 */
const SAMPLE_STRIDE = 29;

/** Pixels are read back to measure progress, so ask for a CPU-side canvas. */
function contextOf(canvas: HTMLCanvasElement) {
  return canvas.getContext("2d", { willReadFrequently: true });
}

function paintFoil(canvas: HTMLCanvasElement, label: string) {
  const { width, height } = canvas.getBoundingClientRect();
  const ctx = contextOf(canvas);
  if (!ctx || !width || !height) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  // Brushed gold: alternating bright and deep bands on the diagonal.
  const sheen = ctx.createLinearGradient(0, 0, width, height);
  sheen.addColorStop(0, "#9a6a12");
  sheen.addColorStop(0.28, "#f4d27c");
  sheen.addColorStop(0.5, "#c08a24");
  sheen.addColorStop(0.72, "#fbe3a0");
  sheen.addColorStop(1, "#a5741a");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height);

  // Foil grain.
  for (let i = 0; i < (width * height) / 18; i++) {
    ctx.fillStyle =
      Math.random() > 0.5 ? "rgba(255, 248, 220, 0.2)" : "rgba(90, 55, 5, 0.14)";
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }

  // A kolam dot grid pressed into it.
  ctx.fillStyle = "rgba(110, 70, 8, 0.3)";
  const pitch = 18;
  for (let y = pitch / 2; y < height; y += pitch) {
    for (let x = pitch / 2; x < width; x += pitch) {
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The label, embossed: a pale edge under dark ink.
  const size = Math.max(17, Math.min(24, width / 12));
  ctx.font = `700 ${size}px "Cormorant Infant", Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 246, 214, 0.8)";
  ctx.fillText(label, width / 2, height / 2 + 1.2);
  ctx.fillStyle = "#3f2702";
  ctx.fillText(label, width / 2, height / 2);
}

/**
 * A scratch card. Drag across the gold foil — finger, pen or mouse — to
 * wear it away; once enough is gone the rest falls away and the content
 * underneath is revealed.
 *
 * The foil is also a button: Enter or Space reveals it outright, as does
 * a screen reader's activate gesture, so nobody has to be able to drag
 * to read what is underneath.
 */
export function ScratchReveal({
  children,
  label,
  revealedText,
  threshold = 0.5,
  onReveal,
  className,
}: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const scratched = useRef(false);
  const revealedRef = useRef(false);
  const focusOnReveal = useRef(false);

  const [started, setStarted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(
    (moveFocus = false) => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      focusOnReveal.current = moveFocus;
      setRevealed(true);
      onReveal?.();
    },
    [onReveal],
  );

  // The foil leaves the tab order as it goes. Hand focus to what it was
  // hiding — once that is no longer aria-hidden — so a keyboard user is
  // not dropped back at the top of the page.
  useEffect(() => {
    if (revealed && focusOnReveal.current) contentRef.current?.focus();
  }, [revealed]);

  // Paint the foil, and repaint it whenever its box changes size — but
  // only until scratching starts, so a resize never restores foil that
  // has already been cleared.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let live = true;
    const paint = () => {
      if (live && !scratched.current && !revealedRef.current) paintFoil(canvas, label);
    };

    paint();
    // The label is drawn in the webfont; repaint once it has arrived.
    document.fonts?.load('700 20px "Cormorant Infant"').then(paint, () => {});
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [label]);

  const pointOf = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const box = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * canvas.width,
      y: ((e.clientY - box.top) / box.height) * canvas.height,
    };
  };

  const scratch = (canvas: HTMLCanvasElement, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = contextOf(canvas);
    if (!ctx) return;
    // Work in canvas pixels here — the points already are.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    const brush = Math.max(canvas.height * 0.22, 22);
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    // A zero-length line draws nothing, so a tap gets its own dab.
    ctx.beginPath();
    ctx.arc(to.x, to.y, brush / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearedFraction = (canvas: HTMLCanvasElement) => {
    const ctx = contextOf(canvas);
    if (!ctx || !canvas.width || !canvas.height) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * SAMPLE_STRIDE) {
      total++;
      if (data[i] < 128) clear++;
    }
    return total ? clear / total : 0;
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (revealedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = pointOf(e);
    last.current = point;
    scratch(e.currentTarget, point, point);
    if (!scratched.current) {
      scratched.current = true;
      setStarted(true);
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    const point = pointOf(e);
    scratch(e.currentTarget, last.current, point);
    last.current = point;
    // Reading pixels back is the costly part; check every few moves, so
    // the foil can fall away mid-stroke without stalling the brush.
    moves.current += 1;
    if (moves.current % 6 === 0 && clearedFraction(e.currentTarget) >= threshold) reveal();
  };

  const onPointerEnd = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    last.current = null;
    if (clearedFraction(e.currentTarget) >= threshold) reveal();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      reveal(true);
    }
  };

  return (
    <div
      className={`scratch ${started ? "scratch--started" : ""} ${revealed ? "scratch--revealed" : ""} ${className ?? ""}`}
    >
      <div
        ref={contentRef}
        className="scratch__content"
        tabIndex={-1}
        aria-hidden={!revealed}
      >
        {children}
      </div>

      <canvas
        ref={canvasRef}
        className="scratch__foil"
        role="button"
        tabIndex={revealed ? -1 : 0}
        aria-label={`${label}. Press Enter to reveal.`}
        aria-hidden={revealed || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
        // detail is 0 for a click no pointer made: a screen reader's
        // activate gesture, or a switch device.
        onClick={(e) => {
          if (e.detail === 0) reveal(true);
        }}
      />

      <p className="visually-hidden" role="status">
        {revealed ? revealedText : ""}
      </p>
    </div>
  );
}
