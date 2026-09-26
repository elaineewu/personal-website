"use client";

import { useCallback, useState } from "react";
import { stringifyApiPayload } from "@/lib/api-payloads";
import JsonHighlight from "./JsonHighlight";

type ApiJsonPanelProps = {
  method?: "GET";
  endpoint: string;
  payload: unknown;
};

export default function ApiJsonPanel({
  method = "GET",
  endpoint,
  payload,
}: ApiJsonPanelProps) {
  const json = stringifyApiPayload(payload);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [json]);

  return (
    <div className="tab-panel-enter max-w-2xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs tracking-wide text-muted sm:text-sm">
          <span className="text-accent">{method}</span>{" "}
          <span className="text-foreground">{endpoint}</span>
        </p>
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded border border-border px-2.5 py-1 text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={endpoint}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-accent"
          >
            Open ↗
          </a>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto rounded-lg border border-border bg-surface/80 p-4">
        <JsonHighlight json={json} />
      </div>
    </div>
  );
}
