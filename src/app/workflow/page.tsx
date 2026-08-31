import type { Metadata } from "next";
import { ComingSoon } from "@/components/studio/coming-soon";

export const metadata: Metadata = { title: "Connected Workflow · Coming soon" };
export default function Page() { return <ComingSoon kind="workflow" />; }
