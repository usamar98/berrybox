import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "teal" | "coral" | "violet" | "neutral";
};

const tones = {
  teal: "border-teal-300/25 bg-teal-300/10 text-teal-100",
  coral: "border-orange-300/25 bg-orange-300/10 text-orange-100",
  violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  neutral: "border-white/12 bg-white/[0.06] text-slate-200",
};

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
