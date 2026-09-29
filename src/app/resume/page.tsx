import type { Metadata } from "next";
import ResumePage from "@/components/ResumePage";

export const metadata: Metadata = {
  title: "Resume | Elaine Wu",
  description:
    "Resume of Elaine Wu, Operations Research & Financial Engineering student at Princeton: education, experience, projects, and skills.",
};

export default function Resume() {
  return <ResumePage />;
}
