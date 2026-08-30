"use client";

import { type ElementType, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

/**
 * Typewriter / rotating text. Adapted from react-bits (TextType) to TSX.
 * Used for the hero's rotating heading word.
 */
type TextTypeProps = {
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  startOnVisible?: boolean;
  onSentenceComplete?: (sentence: string, index: number) => void;
};

export function TextType({
  text,
  as: Component = "span",
  typingSpeed = 70,
  initialDelay = 0,
  pauseDuration = 1800,
  deletingSpeed = 40,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  startOnVisible = false,
  onSentenceComplete,
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getCurrentTextColor = useCallback(() => {
    if (textColors.length === 0) return "inherit";
    return textColors[currentTextIndex % textColors.length];
  }, [textColors, currentTextIndex]);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.isIntersecting && setIsVisible(true));
      },
      { threshold: 0.1 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return;
    let timeout: ReturnType<typeof setTimeout>;
    const currentText = textArray[currentTextIndex];

    const tick = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) return;
          onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
          setCurrentTextIndex((p) => (p + 1) % textArray.length);
          setCurrentCharIndex(0);
        } else {
          timeout = setTimeout(() => setDisplayedText((p) => p.slice(0, -1)), deletingSpeed);
        }
      } else {
        if (currentCharIndex < currentText.length) {
          timeout = setTimeout(() => {
            setDisplayedText((p) => p + currentText[currentCharIndex]);
            setCurrentCharIndex((p) => p + 1);
          }, typingSpeed);
        } else if (textArray.length > 1) {
          if (!loop && currentTextIndex === textArray.length - 1) return;
          timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(tick, initialDelay);
    } else {
      tick();
    }
    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  const Tag = Component as ElementType;

  return (
    <Tag
      ref={containerRef}
      className={cn("inline-flex items-baseline whitespace-pre", className)}
    >
      <span style={{ color: getCurrentTextColor() }}>{displayedText}</span>
      {showCursor && (
        <span
          ref={cursorRef}
          aria-hidden
          className={cn("ml-1 inline-block", shouldHideCursor && "hidden", cursorClassName)}
        >
          {cursorCharacter}
        </span>
      )}
    </Tag>
  );
}

export default TextType;
