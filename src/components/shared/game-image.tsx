import Image from "next/image";
import { cn } from "@/lib/utils";

type GameImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function GameImage({ src, alt, className, priority = false }: GameImageProps) {
  return (
    <div
      className={cn(
        "relative min-h-44 overflow-hidden rounded-lg border border-white/10 bg-[#08101c]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
