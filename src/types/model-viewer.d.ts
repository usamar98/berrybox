import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: string;
  "rotation-per-second"?: string;
  "shadow-intensity"?: string;
  "environment-image"?: string;
  exposure?: string;
  "interaction-prompt"?: "auto" | "none";
  "interaction-prompt-style"?: "basic" | "wiggle";
  "interaction-prompt-threshold"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
