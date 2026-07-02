import { cn } from "@/lib/utils";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  intensity?: "soft" | "strong";
};

export function Panel({
  children,
  className,
  intensity = "soft",
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border backdrop-blur-xl",
        intensity === "soft"
          ? "border-white/10 bg-white/[0.055] shadow-[0_20px_70px_rgba(0,0,0,0.24)]"
          : "border-white/14 bg-[#101827]/90 shadow-[0_28px_90px_rgba(0,0,0,0.38)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
