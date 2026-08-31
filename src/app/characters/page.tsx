import type { Metadata } from "next";
import { ComingSoon } from "@/components/studio/coming-soon";

export const metadata: Metadata = { title: "3D Character Creator · Coming soon" };
export default function Page() { return <ComingSoon kind="character" />; }
