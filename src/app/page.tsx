import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { Preloader } from "@/components/Preloader";
import { Header } from "@/components/Header";
import { ScrollSequence } from "@/components/ScrollSequence";
import { Footer } from "@/components/Footer";
import { About } from "@/sections/About";
import { Spices } from "@/sections/Spices";
import { Certifications } from "@/sections/Certifications";
import { WhyUs } from "@/sections/WhyUs";
import { Contact } from "@/sections/Contact";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Preloader />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <ScrollSequence />
        <About />
        <Spices />
        <Certifications />
        <WhyUs />
        <Contact />
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
