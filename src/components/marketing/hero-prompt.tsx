"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Sparkles } from "lucide-react";

const ideas = [
  "A modular ancient forest portal with mossy stone and low-poly edges",
  "A stylized sci-fi supply crate with removable panels",
  "A fantasy watchtower kit with game-ready topology",
];

export function HeroPrompt() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(ideas[0]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const idea = prompt.trim();
    if (idea.length < 3) return;
    router.push(`/templates?prompt=${encodeURIComponent(idea)}`);
  }

  return (
    <div className="bb-prompt-wrap">
      <form className="bb-prompt" onSubmit={submit}>
        <label htmlFor="berrybox-game-idea" className="sr-only">
          Describe your game idea
        </label>
        <textarea
          id="berrybox-game-idea"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Describe the world you want to build..."
        />
        <div className="bb-prompt-footer">
          <span><Sparkles size={15} /> Text to 3D template</span>
          <button type="submit" aria-label="Open this idea in the builder" disabled={prompt.trim().length < 3}>
            <ArrowUp size={18} />
          </button>
        </div>
      </form>
      <div className="bb-prompt-ideas" aria-label="Example game ideas">
        <span>Try an idea</span>
        {ideas.slice(1).map((idea, index) => (
          <button key={idea} type="button" onClick={() => setPrompt(idea)}>
            0{index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
