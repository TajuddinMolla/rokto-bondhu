import { HeroSection } from "@/components/home/hero-section";
import { DonorSearchPanel } from "@/components/home/donor-search-panel";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { BloodGroupsSection } from "@/components/home/blood-groups-section";
import { BecomeDonorSection } from "@/components/home/become-donor-section";
import { TrustSection } from "@/components/home/trust-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <HeroSection locale="bn" />
      <DonorSearchPanel locale="bn" />
      <HowItWorksSection locale="bn" />
      <BloodGroupsSection locale="bn" />
      <BecomeDonorSection locale="bn" />
      <TrustSection locale="bn" />
      <FinalCtaSection locale="bn" />
    </main>
  );
}
