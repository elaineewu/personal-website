"use client";

import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Research from "@/components/Research";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import TerminalOverlay from "@/components/TerminalOverlay";
import { ViewModeProvider } from "@/components/ViewModeProvider";

function HomePageContent() {
  return (
    <ViewModeProvider>
      <div className="min-h-screen">
        <Sidebar />

        <main className="px-6 pb-24 pt-24 lg:ml-[min(40vw,320px)] lg:px-12 lg:py-16 xl:px-24">
          <div className="mx-auto flex max-w-3xl flex-col gap-24 lg:gap-32">
            <About />
            <Experience />
            <Projects />
            <Research />
            <Contact />
          </div>

          <Footer />
        </main>
      </div>
      <TerminalOverlay />
    </ViewModeProvider>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
