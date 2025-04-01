import { useEffect, useRef, useState } from "react";

export function useTypingEffect(fullText: string, typingSpeed = 100) {
  const [typedText, setTypedText] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    let current_index = 0;
    const typeNextCharacter = () => {
      if (current_index < fullText.length) {
        setTypedText(fullText.slice(0, current_index + 1));
        current_index++;
        timeoutRef.current = setTimeout(typeNextCharacter, typingSpeed);
      }
    };
    typeNextCharacter();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fullText, typingSpeed]);

  const renderTypingEffect = () => {
    return (
      <p className="text-xl">
        {typedText}
        <span className="animate-blink">❚</span>
      </p>
    );
  };

  return renderTypingEffect;
}
