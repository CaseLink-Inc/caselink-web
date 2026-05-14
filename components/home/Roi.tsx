export default function Roi() {
  return (
    <section className="roi-sec">
      <div className="wrap">
        <div className="roi-head reveal">
          <span className="eyebrow">Return on investment</span>
          <h2>
            One new case covers the<br />
            <span className="grad-warm">whole year.</span>
          </h2>
          <p>
            A single new patient referred through CaseLink typically covers
            more than twelve months of your subscription.
          </p>
        </div>

        <div className="roi-row">
          <div className="roi-card reveal">
            <div className="roi-card-lbl">Average specialist case value</div>
            <div className="roi-card-num">$4,200</div>
            <div className="roi-card-sub">A single Invisalign, endodontic, or implant case</div>
          </div>
          <div className="roi-divider" aria-hidden="true">÷</div>
          <div className="roi-card warm reveal" style={{ transitionDelay: ".1s" }}>
            <div className="roi-card-lbl">CaseLink Specialist plan</div>
            <div className="roi-card-num">$299 / month</div>
            <div className="roi-card-sub">$3,588 per year on monthly billing</div>
          </div>
          <div className="roi-divider" aria-hidden="true">=</div>
          <div className="roi-card cool reveal" style={{ transitionDelay: ".2s" }}>
            <div className="roi-card-lbl">Return on a single case</div>
            <div className="roi-card-num">14 months covered</div>
            <div className="roi-card-sub">Every additional case after that is profit</div>
          </div>
        </div>

        <p className="roi-note">
          Numbers above use a conservative $4,200 case value. Actual returns
          vary by specialty and case mix.
        </p>
      </div>
    </section>
  );
}
