"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Click-to-play facade around the Claude Design animation export, which is
 * served as a standalone page from /public/intro/.
 *
 * Until the visitor clicks, this renders a poster image and a play button and
 * nothing else. The <iframe> is not in the DOM, so none of the animation's
 * assets (React, Babel, the bundle, the voiceover and music) are requested and
 * the section costs one lazy-loaded image. Running it in an iframe also keeps
 * its globals, styles, and React copy fully isolated from the Next.js app.
 */
export default function IntroVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="intro-video" className="introvid-sec">
      <div className="wrap introvid-inner">
        <div className="section-head introvid-head reveal">
          <span className="eyebrow">Watch the intro</span>
          <h2>See CaseLink<br />in three minutes.</h2>
          <p>
            The full walkthrough. Your network, your referrals, and every case
            tracked from both sides.
          </p>
        </div>

        <div className="introvid-frame reveal">
          {playing ? (
            <iframe
              className="introvid-player"
              src="/intro/index.html"
              title="CaseLink introduction"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="introvid-poster"
              onClick={() => setPlaying(true)}
              aria-label="Play the CaseLink introduction, 2 minutes 50 seconds"
            >
              <Image
                src="/intro/poster.jpg"
                alt="The CaseLink dashboard showing referrals waiting on a decision, practices in the network, and recent referral activity."
                width={1920}
                height={1080}
                sizes="(max-width: 900px) 100vw, 1100px"
                className="introvid-posterimg"
              />
              <span className="introvid-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
                </svg>
              </span>
              <span className="introvid-duration" aria-hidden="true">2:50</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
