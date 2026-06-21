"use client";

import { useEffect, useState } from "react";

const TYPING_MS = 55;
const ERASING_MS = 35;
const PAUSE_MS = 2500;

type Phase = "typing" | "erasing";

type TypewriterTaglineProps = {
  text: string;
  className?: string;
};

export default function TypewriterTagline({
  text,
  className = "",
}: TypewriterTaglineProps) {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((visible) => !visible);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (displayed.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length + 1));
        }, TYPING_MS);
      } else {
        timeout = setTimeout(() => setPhase("erasing"), PAUSE_MS);
      }
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length - 1));
        }, ERASING_MS);
      } else {
        timeout = setTimeout(() => setPhase("typing"), 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, phase, text]);

  return (
    <p
      className={`relative mt-4 max-w-[240px] min-h-[5.5rem] text-base leading-relaxed text-muted ${className}`}
      aria-label={text}
    >
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0">
        {displayed}
        <span
          className="ml-px font-mono text-accent"
          style={{ opacity: cursorVisible ? 1 : 0 }}
          aria-hidden="true"
        >
          |
        </span>
      </span>
    </p>
  );
}
