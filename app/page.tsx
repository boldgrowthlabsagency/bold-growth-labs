import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import LaptopReveal from '@/components/LaptopReveal';
import EssentialsCloud from '@/components/EssentialsCloud';
import Services from '@/components/Services';
import Process from '@/components/Process';
import Portfolio from '@/components/Portfolio';
import Pricing from '@/components/Pricing';
import AddOnBuilder from '@/components/AddOnBuilder';
import FAQ from '@/components/FAQ';
import ContactForm from '@/components/ContactForm';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import SmoothScroll from '@/components/SmoothScroll';

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <CustomCursor />
      <Navbar />
      <main id="main">
        <Hero />
        <LaptopReveal />
        <EssentialsCloud />
        <Services />
        <Process />
        <Portfolio />
        <Pricing />
        <AddOnBuilder />
        <FAQ />
        <ContactForm />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
