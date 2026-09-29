import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";

const RESUME_PDF = "/Resume_Wu_Elaine.pdf";

export const metadata: Metadata = {
  title: "Resume | Elaine Wu",
  description: "Resume of Elaine Wu.",
};

export default function ResumePage() {
  return (
    <div className="min-h-screen px-6 pb-24 pt-12 lg:px-12 lg:py-16 xl:px-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </Link>
          <a
            href={RESUME_PDF}
            download
            className="inline-flex items-center gap-2 rounded-md border border-accent/60 px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Download PDF
          </a>
        </div>

        <object
          data={RESUME_PDF}
          type="application/pdf"
          aria-label="Elaine Wu resume"
          className="h-[85vh] w-full rounded-lg border border-border bg-surface"
        >
          <p className="p-6 text-sm text-muted">
            Your browser can&apos;t display the PDF here.{" "}
            <a href={RESUME_PDF} className="text-accent hover:underline">
              Open the resume
            </a>{" "}
            instead.
          </p>
        </object>
      </div>
    </div>
  );
}
