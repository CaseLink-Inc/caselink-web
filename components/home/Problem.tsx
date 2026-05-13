export default function Problem() {
  return (
    <section className="problem">
      <div className="wrap">
        <div className="eyebrow-wrap reveal"><span className="eyebrow">The problem we are solving</span></div>
        <h2 className="reveal">Dental referrals quietly<br />fall apart every day.</h2>
        <p className="problem-sub reveal">
          A paper slip, a phone call, an email nobody opens. The cost shows up in patients, partnerships, and revenue.
        </p>
        <div className="problem-stats-row cols-2">
          <div className="big-stat reveal">
            <div className="num">30%</div>
            <h4>of referrals never reach treatment</h4>
            <p>Patients drop off between the GP and the specialist, often without anyone knowing.</p>
            <div className="src">Industry research</div>
          </div>
          <div className="big-stat alt reveal" style={{ transitionDelay: ".1s" }}>
            <div className="num">&lt;2%</div>
            <h4>use a dedicated referral tool</h4>
            <p>The category exists for medical referrals. In dentistry, it is wide open.</p>
            <div className="src">US dental practices</div>
          </div>
        </div>
      </div>
    </section>
  );
}
