import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="notfound-sec">
      <div className="wrap notfound-inner">
        {/* Network-themed illustration. Two practice pins try to talk to
            each other, the connection is broken in the middle. Same visual
            grammar as the home page Network section: pulse rings, dashed
            beam, travelling dots. */}
        <div className="nf-stage">
          <svg
            viewBox="0 0 600 260"
            className="nf-viz"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <pattern id="nfgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E8EEF8" strokeWidth="0.6" />
              </pattern>
              <linearGradient id="nfbeamA" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3DBD6B" stopOpacity="0" />
                <stop offset="50%" stopColor="#3DBD6B" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3DBD6B" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="nfbeamB" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFA940" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFA940" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFA940" stopOpacity="0" />
              </linearGradient>
              <path id="nfPathA" d="M 130 130 Q 200 100 270 130" />
              <path id="nfPathB" d="M 330 130 Q 400 160 470 130" />
            </defs>

            {/* faint grid */}
            <rect width="100%" height="100%" fill="url(#nfgrid)" opacity="0.55" />

            {/* paths from each pin toward the missing centre */}
            <use href="#nfPathA" fill="none" stroke="url(#nfbeamA)" strokeWidth="2" strokeDasharray="6 8" className="nf-beam" />
            <use href="#nfPathB" fill="none" stroke="url(#nfbeamB)" strokeWidth="2" strokeDasharray="6 8" className="nf-beam nf-beam-delay" />

            {/* GP pin (green) on the left */}
            <g className="nf-pin">
              <circle cx="130" cy="130" r="22" fill="none" stroke="#3DBD6B" strokeWidth="2" opacity="0.4" className="nf-pulse">
                <animate attributeName="r" from="18" to="44" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle cx="130" cy="130" r="14" fill="#3DBD6B" stroke="#fff" strokeWidth="3" />
              <text x="130" y="172" textAnchor="middle" fill="#7A8886" fontSize="10" fontFamily="'Satoshi'" fontWeight="600">
                Dr. Chen · GP
              </text>
            </g>

            {/* Specialist pin (orange) on the right */}
            <g className="nf-pin">
              <circle cx="470" cy="130" r="22" fill="none" stroke="#FFA940" strokeWidth="2" opacity="0.4" className="nf-pulse">
                <animate attributeName="r" from="18" to="44" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
              </circle>
              <circle cx="470" cy="130" r="14" fill="#FFA940" stroke="#fff" strokeWidth="3" />
              <text x="470" y="172" textAnchor="middle" fill="#7A8886" fontSize="10" fontFamily="'Satoshi'" fontWeight="600">
                Dr. Lee · Spec
              </text>
            </g>

            {/* the gap. A faint dashed circle with a glowing question
                mark inside, where the referral should have arrived. */}
            <g className="nf-gap">
              <circle cx="300" cy="130" r="30" fill="rgba(62,142,255,0.06)" stroke="rgba(62,142,255,0.35)" strokeWidth="1.4" strokeDasharray="4 5">
                <animateTransform attributeName="transform" type="rotate" from="0 300 130" to="360 300 130" dur="14s" repeatCount="indefinite" />
              </circle>
              <text x="300" y="139" textAnchor="middle" fill="#3E8EFF" fontSize="28" fontFamily="'Satoshi'" fontWeight="700">
                ?
              </text>
            </g>

            {/* travelling dots that try to make the trip and don't.
                They start at each pin, head toward the centre, and fade
                just before reaching it. Looped continuously. */}
            <circle r="5" fill="#3DBD6B" opacity="0.95" className="nf-dot">
              <animateMotion dur="2.6s" repeatCount="indefinite">
                <mpath href="#nfPathA" />
              </animateMotion>
              <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.1;0.85;1" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle r="5" fill="#FFA940" opacity="0.95" className="nf-dot">
              <animateMotion dur="2.6s" begin="1.3s" repeatCount="indefinite">
                <mpath href="#nfPathB" />
              </animateMotion>
              <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.1;0.85;1" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <div className="nf-code">
          <span className="grad-text">404</span>
        </div>
        <h1>This referral got lost in transit.</h1>
        <p className="lead">
          Even the strongest networks have gaps. The page you were looking
          for did not make it through. Let&apos;s reroute you.
        </p>
        <div className="hero-cta nf-cta">
          <Link href="/" className="btn btn-primary">
            Back to home
            <ArrowRight width={14} height={14} />
          </Link>
          <Link href="/contact" className="btn btn-ghost">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
