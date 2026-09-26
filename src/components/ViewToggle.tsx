"use client";

import { useViewMode, type SiteViewMode } from "./ViewModeProvider";

const options: { value: SiteViewMode; label: string }[] = [
  { value: "human", label: "Human" },
  { value: "api", label: "API" },
];

type ViewToggleProps = {
  className?: string;
};

export default function ViewToggle({ className = "" }: ViewToggleProps) {
  const { mode, setMode } = useViewMode();

  return (
    <div
      className={`inline-flex rounded-md border border-border bg-background/80 p-0.5 font-mono text-xs ${className}`}
      role="group"
      aria-label="View mode"
    >
      {options.map(({ value, label }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={active}
            className={`rounded px-2.5 py-1 transition-colors ${
              active
                ? "bg-surface text-accent shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_25%,transparent)]"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
