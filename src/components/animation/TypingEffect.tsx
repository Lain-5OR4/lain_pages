"use client";
import { useEffect, useState } from "react";

// Types `text` out one character at a time. Being a component (rather than a
// hook returning a render function) keeps the per-character re-renders scoped
// to this small <p> instead of the whole caller.
export function TypingEffect({ text, typingSpeed = 100 }: { text: string; typingSpeed?: number }) {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    setTypedText("");
    let index = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const typeNextCharacter = () => {
      if (index < text.length) {
        index++;
        setTypedText(text.slice(0, index));
        timeout = setTimeout(typeNextCharacter, typingSpeed);
      }
    };
    timeout = setTimeout(typeNextCharacter, typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, typingSpeed]);

  return (
    <p className="text-xl">
      {typedText}
      <span className="animate-blink">❚</span>
    </p>
  );
}
