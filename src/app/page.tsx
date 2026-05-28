import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import BottleCarousel from "@/components/BottleCarousel";
import Collection from "@/components/Collection";
import ImageBreak from "@/components/ImageBreak";
import Approach from "@/components/Approach";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FluidBackground from "@/components/FluidBackground";

export default function Home() {
  return (
    <>
      {/* Fixed generative fluid background */}
      <FluidBackground />

      {/* Content floats above */}
      <div className="relative z-10">
        <Navigation />
        <main>
          <Hero />
          <BottleCarousel />
          <Collection />
          <ImageBreak />
          <Approach />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
