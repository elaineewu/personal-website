"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiEndpointCatalog } from "@/lib/data";
import {
  setTerminalOpen,
  useTerminalOpen,
} from "./ViewModeProvider";

const KNOWN_GET_PATHS = [
  "/api",
  ...apiEndpointCatalog.map((entry) => entry.path),
];

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.isContentEditable
  );
}

function normalizeCommand(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

export default function TerminalOverlay() {
  const open = useTerminalOpen();
  const [lines, setLines] = useState<string[]>([
    'Type "help" for commands. Press Esc to close.',
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const appendLines = useCallback((next: string[]) => {
    setLines((prev) => [...prev, ...next]);
  }, []);

  const runCommand = useCallback(
    async (raw: string) => {
      const command = normalizeCommand(raw);
      if (!command) return;

      appendLines([`> ${command}`]);

      const lower = command.toLowerCase();

      if (lower === "help") {
        appendLines([
          "Commands:",
          "  help              Show this message",
          "  ls                List API endpoints",
          "  GET /api/...      Fetch JSON from an endpoint",
          "  clear             Clear the terminal",
          "  exit              Close the terminal",
        ]);
        return;
      }

      if (lower === "clear") {
        setLines([]);
        return;
      }

      if (lower === "exit") {
        setTerminalOpen(false);
        return;
      }

      if (lower === "ls") {
        appendLines(["Endpoints:", ...KNOWN_GET_PATHS.map((path) => `  ${path}`)]);
        return;
      }

      const getMatch = command.match(/^GET\s+(\/api(?:\/[^\s]*)?)\/?$/i);
      if (getMatch) {
        const path = getMatch[1].replace(/\/$/, "") || "/api";
        if (!path.startsWith("/api")) {
          appendLines(['Paths must start with "/api". Try "ls".']);
          return;
        }

        try {
          const response = await fetch(path);
          const text = await response.text();
          appendLines([`${response.status} ${response.statusText}`, text]);
        } catch {
          appendLines(["Request failed. Is the dev server running?"]);
        }
        return;
      }

      appendLines([
        `Unknown command: ${command}`,
        'Try "help" for available commands.',
      ]);
    },
    [appendLines],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const value = input;
      setInput("");
      setHistory((prev) => [...prev, value]);
      setHistoryIndex(-1);
      await runCommand(value);
    },
    [input, runCommand],
  );

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setTerminalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (open || isEditableTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "/" || event.key === "`") {
        event.preventDefault();
        setTerminalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setTerminalOpen(false);
        }
      }}
    >
      <div className="flex max-h-[min(80vh,520px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-[#0a0e12] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono text-xs text-muted">
          <span>terminal</span>
          <button
            type="button"
            onClick={() => setTerminalOpen(false)}
            className="text-muted transition-colors hover:text-accent"
          >
            esc
          </button>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 font-mono text-xs leading-relaxed text-muted sm:text-sm"
        >
          {lines.map((line, index) => (
            <div key={`${index}-${line.slice(0, 12)}`} className="whitespace-pre-wrap break-words">
              {line}
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-border px-4 py-3 font-mono text-xs sm:text-sm"
        >
          <span className="text-accent">&gt;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                if (history.length === 0) return;
                setHistoryIndex((prev) => {
                  const nextIndex =
                    prev < 0 ? history.length - 1 : Math.max(0, prev - 1);
                  setInput(history[nextIndex] ?? "");
                  return nextIndex;
                });
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                if (history.length === 0) return;
                setHistoryIndex((prev) => {
                  if (prev < 0) return prev;
                  const nextIndex = prev + 1;
                  if (nextIndex >= history.length) {
                    setInput("");
                    return -1;
                  }
                  setInput(history[nextIndex] ?? "");
                  return nextIndex;
                });
              }
            }}
            className="min-w-0 flex-1 border-0 bg-transparent text-foreground outline-none"
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command"
          />
        </form>
      </div>
    </div>
  );
}
