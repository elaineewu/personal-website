import Sidebar from "@/components/Sidebar";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="px-6 pb-24 pt-24 lg:ml-[min(40vw,320px)] lg:px-12 lg:py-16 xl:px-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-24 lg:gap-32">
          <About />
          <Projects />
          <Contact />
        </div>

        <footer className="mx-auto mt-32 max-w-3xl border-t border-border pt-8 font-mono text-xs text-muted">
          <p>
            Built by Elaine Wu &middot;{" "}
            <span className="text-accent">2026</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
