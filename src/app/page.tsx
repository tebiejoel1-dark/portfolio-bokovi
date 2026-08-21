"use client";

import { useEffect, useState } from "react";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ShowreelModal from "@/components/ShowreelModal";
import Marquee from "@/components/Marquee";
import Deconstruction from "@/components/Deconstruction";
import About from "@/components/About";
import Works from "@/components/Works";
import BeforeAfter from "@/components/BeforeAfter";
import Calculator from "@/components/Calculator";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { initSmoothScroll, ScrollTrigger } from "@/lib/gsap";
import { trackVisit } from "@/lib/analytics";

export default function Home() {
  const [reelOpen, setReelOpen] = useState(false);

  useEffect(() => {
    initSmoothScroll();
    trackVisit();

    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 2600);
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);

    return () => {
      clearTimeout(t);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <main className="relative">
      <Preloader />
      <CustomCursor />
      <Navbar />
      <div className="noise-overlay" />
      <Hero onPlay={() => setReelOpen(true)} />
      <ShowreelModal open={reelOpen} onClose={() => setReelOpen(false)} />
      <Marquee />
      <Deconstruction />
      <About />
      <Works />
      <BeforeAfter />
      <Calculator />
      <Contact />
      <Footer />
    </main>
  );
}