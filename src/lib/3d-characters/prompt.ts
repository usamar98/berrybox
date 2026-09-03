import type { CharacterBodyPlan, CharacterPose, CharacterStyle } from "./types";

// Leave deterministic headroom for the server's full-body/isolation direction
// while staying below Meshy's 800-character prompt limit.
export const CHARACTER_PROMPT_MAX = 420;

const styleDirections: Record<CharacterStyle, string> = {
  stylized: "stylized premium game-art materials and a clean readable silhouette",
  realistic: "realistic proportions and physically plausible premium materials",
  anime: "anime-inspired proportions, expressive shapes, and polished stylized materials",
  "low-poly": "intentional low-poly forms, crisp faceting, and a clean game-art palette",
};

const bodyDirections: Record<CharacterBodyPlan, string> = {
  humanoid: "one complete bipedal humanoid character with clearly separated limbs",
  creature: "one complete original creature with a coherent body and clearly readable limbs",
  robot: "one complete original robot character with articulated mechanical limbs",
};

const poseDirections: Record<CharacterPose, string> = {
  "a-pose": "a relaxed A-pose",
  "t-pose": "a clean T-pose",
  neutral: "a balanced neutral standing pose",
};

export function buildCharacterPrompt(input: {
  prompt: string;
  style: CharacterStyle;
  bodyPlan: CharacterBodyPlan;
  pose: CharacterPose;
}) {
  const brief = input.prompt.replace(/\s+/g, " ").trim().replace(/[.\s]+$/, "");
  return `${brief}. Create ${bodyDirections[input.bodyPlan]} in ${poseDirections[input.pose]}, full body visible from head to feet, centered and isolated. Use ${styleDirections[input.style]}. No environment, floor, pedestal, text, extra characters, cropped limbs, or merged body parts.`;
}
