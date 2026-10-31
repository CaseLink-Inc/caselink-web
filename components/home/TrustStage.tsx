import Image from "next/image";

/**
 * The Trust hero object.
 *
 * G8 Ice mesh ground (the system's own "behind glass cards" ground, and one
 * of the six the icon set is approved on), the "HIPAA secure" padlock at the
 * centre, and five patient records orbiting it.
 *
 * The records are product glass, not icons. The four claim cards below are
 * already a row of frosted icons, so repeating the treatment up here made
 * the section read as the same thing twice. These are the thing being
 * protected rather than another label for the protection: a glass card with
 * a tinted header and two blanked lines, which is also why they carry no
 * copy and are hidden from assistive tech.
 *
 * Each record travels a real ellipse around the lock, passing behind it and
 * then in front. Depth is scale, opacity and z-index, never a shadow, which
 * the system forbids. Motion lives in globals.css under .ts-*.
 */
const records = ["ts-sat-1", "ts-sat-2", "ts-sat-3", "ts-sat-4", "ts-sat-5"];

/* The data field behind the lock: the records that are not in the air, as a
   quiet field of binary in white, masked so it is strongest in the ring
   around the padlock and gone by the frame edge.

   The digits change. Each cell is a window onto a four-line strip of
   alternating bits that steps upward, so the character flips in place
   rather than fading, and each cell runs on its own clock. The result is a
   field that is always changing somewhere and never changing everywhere.
   The strip is a pseudo-element moved by transform, which the compositor
   owns, so a hundred live cells cost no paint.

   Every value here is derived from the cell's index rather than drawn at
   random, so the server and the browser render the same field. The periods
   are mutually prime with each other and with the delay cycle, which is
   what stops the field falling into step with itself. */
const BITS = "100101110010110100111010001011011100101001110100101100111";
/* Four steps to a period, so these are a digit changing every six to nine
   seconds. Faster than that and a hundred cells read as churn. */
const PERIODS = [23.3, 27.1, 31.7, 35.9];
const COLS = 13;
const ROWS = 8;
const digits = Array.from({ length: COLS * ROWS }, (_, n) => ({
  n,
  /* Which bit the cell rests on, so the field reads as mixed data. */
  zero: BITS[n % BITS.length] === "0",
  delay: `${(((n * 7) % 23) * 0.37).toFixed(2)}s`,
  period: `${PERIODS[(n * 5) % PERIODS.length]}s`,
}));

export default function TrustStage() {
  return (
    <figure className="trust-stage reveal">
      <span className="ts-ground cl-bg-icemesh" aria-hidden="true" />
      <span className="ts-matrix" aria-hidden="true">
        {digits.map((c) => (
          <i
            key={c.n}
            className={c.zero ? "ts-z" : undefined}
            /* Custom properties, not the animation shorthand: the strip is a
               pseudo-element, and these inherit into it where a shorthand
               set here would not reach it. */
            style={{ "--dl": c.delay, "--p": c.period } as React.CSSProperties}
          />
        ))}
      </span>
      <span className="ts-wash" aria-hidden="true" />

      {records.map((cls) => (
        <span key={cls} className={`ts-sat ${cls}`} aria-hidden="true">
          {/* Two elements on purpose: the outer one carries the orbit, the
              inner one the entrance, so the two never fight over opacity. */}
          <span className="ts-rec cl-glass cl-glass--thin">
            <i className="ts-rec-bar" />
            <i className="ts-rec-line" />
            <i className="ts-rec-line ts-rec-line--short" />
          </span>
        </span>
      ))}

      <span className="ts-core">
        <Image
          src="/ds/icons/caselink-hipaa-lock.svg"
          alt="HIPAA secure: a padlock in frosted glass with patient records circling it, all of them sealed."
          width={248}
          height={248}
        />
      </span>
    </figure>
  );
}
