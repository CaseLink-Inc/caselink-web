import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Network from "@/components/home/Network";
import ForWho from "@/components/home/ForWho";
import Trust from "@/components/home/Trust";
import Roi from "@/components/home/Roi";
import Pricing from "@/components/home/Pricing";
import CtaBand from "@/components/home/CtaBand";
import { LOGIN_URL, SIGNUP_URL } from "@/lib/urls";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Network />
      <ForWho />
      <Trust />
      <Roi />
      <Pricing />
      <CtaBand
        title={<>Better referrals<br />start with one signup.</>}
        body="Free forever for general dentists. Free 14-day trial for specialists. No setup fee, no contract, and your first referral can go out the same afternoon."
        primary={{ href: SIGNUP_URL, label: "Get started free", external: true }}
        secondary={{ href: LOGIN_URL, label: "Login now", external: true }}
      />
    </>
  );
}
