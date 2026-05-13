import Hero from "@/components/home/Hero";
import Problem from "@/components/home/Problem";
import HowItWorks from "@/components/home/HowItWorks";
import Network from "@/components/home/Network";
import ForWho from "@/components/home/ForWho";
import Trust from "@/components/home/Trust";
import Pricing from "@/components/home/Pricing";
import CtaBand from "@/components/home/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Network />
      <ForWho />
      <Trust />
      <Pricing />
      <CtaBand
        title={<>Better referrals<br />start with one signup.</>}
        body="Free forever for general dentists. Free 14-day trial for specialists. No setup fee, no contract, and your first referral can go out the same afternoon."
        primary={{ href: "/contact", label: "Get started free" }}
        secondary={{ href: "/contact", label: "Book a 15 minute demo" }}
      />
    </>
  );
}
