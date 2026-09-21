import { Hero } from "@/components/hero/Hero";
import { Statement } from "@/components/sections/Statement";
import { Story } from "@/components/sections/Story";
import { Services } from "@/components/sections/Services";
import { WhySOS } from "@/components/sections/WhySOS";
import { Packages } from "@/components/sections/Packages";
import { About } from "@/components/sections/About";
import { Philosophy } from "@/components/sections/Philosophy";
import { Portfolio } from "@/components/sections/Portfolio";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";
import { Ending } from "@/components/sections/Ending";

/** One continuous film. */
export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <Story />
      <Services />
      <WhySOS />
      <Packages />
      <About />
      <Philosophy />
      <Portfolio />
      <Contact />
      <Footer />
      <Ending />
    </>
  );
}
